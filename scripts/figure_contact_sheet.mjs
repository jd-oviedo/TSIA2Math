// figure_contact_sheet.mjs -- render every figure to one reviewable page.
//
//   node scripts/figure_contact_sheet.mjs                 all real specs
//   node scripts/figure_contact_sheet.mjs --pool          one cell per worksheet-eligible ITEM
//
// WHY BOTH VIEWS. `--pool` renders one cell per item a worksheet can draw, 54
// of them, labelled with the topic and item number, so a reviewer checking "is
// item 14 right" finds item 14 rather than having to know it is drawn by
// gr-2-1-notched. The default renders one cell per SPEC, 71 of them, which is
// the set that actually changes when a generator changes: the pool's 54 items
// come from only 22 distinct specs, and the other 49 specs appear on student
// lesson pages, where the same figures render and where a regression is just as
// visible.
//
// harness-* specs are excluded. They are deliberately extreme fixtures owned by
// faultproof_figures.mjs and reviewing them as content wastes the reviewer's
// attention. See verify_figure_labels.mjs for the same exclusion.
//
// The page is white, matching the paper and the new figure background, so a
// figure that still carries the old cream surface is obvious rather than
// blending into a tinted sheet.

import { chromium } from 'playwright';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { basename, join } from 'path';
import { figureFromSpec } from './make_figure.mjs';

const DIR = 'curriculum/figures';
const SRC = 'curriculum/source/tsia2-math';
const args = process.argv.slice(2);
const POOL = args.includes('--pool');
const outArg = args.indexOf('--out');
const OUT = outArg >= 0 ? args[outArg + 1] : (POOL ? 'scratchpad/figures-pool.png' : 'scratchpad/figures-all.png');

const FIG_MARKER = /<!--\s*figure:\s*([a-z0-9-]+)\s*-->/g;

// One cell per worksheet-eligible item, by walking the markdown the same way
// the uploader splits it: Part 2 and Part 3, items with A-D choices.
function poolCells() {
  const PART = /^#### \*\*Part (\d):/;
  const cells = [];
  for (const unit of readdirSync(SRC)) {
    for (const file of readdirSync(join(SRC, unit))) {
      if (!file.endsWith('.md')) continue;
      const topic = basename(file, '.md');
      const body = readFileSync(join(SRC, unit, file), 'utf8');
      const lines = body.split('\n');
      let part = 0, section = null, itemNo = null, buf = [];
      const flush = () => {
        if (!section || itemNo === null) return;
        const text = buf.join('\n');
        if (!/^\s*-\s+[A-D]\)/m.test(text)) return; // free response, not printable
        const figs = [...text.matchAll(FIG_MARKER)].map((m) => m[1]);
        for (const f of figs) cells.push({ spec: f, label: `${topic} ${section} #${itemNo}` });
      };
      for (const line of lines) {
        const p = line.match(PART);
        if (p) { flush(); part = Number(p[1]); section = part === 2 ? 'practice' : part === 3 ? 'mini_quiz' : null; itemNo = null; buf = []; continue; }
        if (!section) continue;
        const practice = line.match(/^(\d+)\.\s/);
        const quiz = line.match(/^\*\*Item (\d+)\*\*/);
        if ((section === 'practice' && practice) || (section === 'mini_quiz' && quiz)) {
          flush();
          itemNo = Number((practice || quiz)[1]);
          buf = [line];
          continue;
        }
        if (itemNo !== null) buf.push(line);
      }
      flush();
    }
  }
  return cells;
}

const specCells = () => readdirSync(DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('harness-'))
  .map((f) => basename(f, '.json'))
  .sort()
  .map((spec) => ({ spec, label: spec }));

const cells = POOL ? poolCells() : specCells();
const cache = new Map();
const rendered = cells.map(({ spec, label }) => {
  if (!cache.has(spec)) {
    cache.set(spec, figureFromSpec(JSON.parse(readFileSync(`${DIR}/${spec}.json`, 'utf8'))).svg);
  }
  return `<figure><div class="f">${cache.get(spec)}</div><figcaption><b>${label}</b>${POOL ? `<br><span class="s">${spec}</span>` : ''}</figcaption></figure>`;
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
await page.setContent(`<body>
  <h1>${POOL ? `Worksheet-eligible figures: ${cells.length} items from ${cache.size} specs` : `All curriculum figure specs: ${cells.length}`}</h1>
  <div class="grid">${rendered.join('')}</div>
  <style>
    body { margin:0; padding:18px; background:#fff; font:12px ui-sans-serif,system-ui,sans-serif; color:#0E0E11 }
    h1 { font-size:15px; margin:0 0 14px }
    /* Generous gutters and padding INSIDE each cell. Reviewing the first sheet
       raised six figures as "too close to the neighbour", and measuring each one
       individually at its real size showed every one of them clearing its own
       canvas by 10 to 34px. The crowding was this grid, not the figures. The
       sheet is a review instrument, so it has to stop manufacturing defects. */
    .grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:34px 30px }
    figure { margin:0 }
    .f { border:1px solid #d8d8d8; border-radius:6px; overflow:hidden; display:flex;
         justify-content:center; background:#fff; padding:12px }
    svg { display:block; max-width:100%; height:auto }
    figcaption { padding:4px 0 0; font-size:11px; line-height:1.35 }
    .s { color:#666 }
  </style>
</body>`, { waitUntil: 'load' });

mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(OUT, await page.screenshot({ fullPage: true }));
await browser.close();
console.log(`${OUT}  (${cells.length} cells, ${cache.size} distinct specs)`);
