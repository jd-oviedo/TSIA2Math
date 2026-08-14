// render_check_curriculum.mjs -- READ-ONLY. Renders curriculum markdown through
// the real app pipeline and reports KaTeX failures.
//
// scripts/lint_curriculum_source.py approximates the render with regexes, which
// is fast but can only guess. This runs the actual unified/remark-math/
// rehype-katex chain from lib/curriculum-utils.ts, so what it reports is what
// the page will do.
//
// Note on dollars: a literal `$` in the OUTPUT html is correct, since that is
// what `\$` is supposed to become. The defect is prose captured INSIDE a math
// span, which is what an unescaped currency dollar produces once remark-math
// pairs it with the next dollar downstream.
//
//   node scripts/render_check_curriculum.mjs curriculum/source/tsia2-math/unit-1
//   node scripts/render_check_curriculum.mjs curriculum/source/tsia2-math/unit-1 QR.2.2 QR.2.3
//
// Must run from the repo root so the remark packages resolve.

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { readFileSync, readdirSync } from 'fs';

// Same pipeline as lib/curriculum-utils.ts renderMarkdownWithMath.
const render = md => String(unified().use(remarkParse).use(remarkGfm).use(remarkMath)
  .use(remarkRehype).use(rehypeKatex).use(rehypeStringify).processSync(md));
const strip = md => md.replace(/```json\n[\s\S]*?\n```\n?/g, '');

// A literal `$` in the OUTPUT is correct: it is what `\$` is supposed to
// become. The real defect is prose captured inside a math span, which is what
// an unescaped currency dollar does once remark-math pairs it with the next
// one downstream.
const PROSE = /[a-z]{3,}\s+[a-z]{2,}\s+[a-z]{2,}/;

const dir = process.argv[2];
const targets = process.argv.slice(3);
let bad = 0;
for (const f of readdirSync(dir).filter(f => f.endsWith('.md') && (!targets.length || targets.includes(f.replace('.md',''))))) {
  const body = readFileSync(`${dir}/${f}`, 'utf8').replace(/^---[\s\S]*?\n---\n/, '');
  let html;
  try { html = render(strip(body)); } catch (e) { console.log(`✗ ${f}: THREW ${e.message}`); bad++; continue; }

  const errs = [...html.matchAll(/class="katex-error"[^>]*title="([^"]*)"/g)].map(m => m[1]);
  // The annotation carries the original TeX source of each math span.
  const sources = [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)]
    .map(m => m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
  // \text{...} and \textbf{...} legitimately hold English inside math, so
  // their contents are removed before the prose test.
  const swallowed = sources.filter(s =>
    PROSE.test(s.replace(/\\(?:text|textbf|textit|mathrm|operatorname)\{[^{}]*\}/g, ' ')));

  if (errs.length || swallowed.length) {
    bad++;
    console.log(`✗ ${f}: ${errs.length} katex error(s), ${swallowed.length} span(s) with prose inside`);
    errs.slice(0,3).forEach(e => console.log(`     error: ${e}`));
    swallowed.slice(0,3).forEach(s => console.log(`     swallowed: ${s.slice(0,70).replace(/\n/g,' ')}`));
  } else {
    console.log(`✓ ${f}: ${sources.length} math spans, 0 errors, 0 prose swallowed`);
  }
}
process.exit(bad ? 1 : 0);
