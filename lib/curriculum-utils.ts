import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import type { Element, Parent, Root, RootContent } from 'hast';

// A wide table has to scroll inside the card rather than push the whole page
// sideways on a phone. The table cannot be its own scroll container: that needs
// `display: block`, and a table that is not `display: table` stops being
// announced as a table by screen readers -- rows and columns simply go away.
// These are data tables in study material, so that trade is not available.
//
// The scroll box is therefore a wrapper element, added here so it applies to
// every table in the curriculum rather than being authored by hand into the
// forty-odd markdown files that carry one. The matching rules live in
// topic-page-css.ts under .um-table-scroll.
function rehypeScrollableTables() {
  return (tree: Root) => {
    const walk = (node: Parent) => {
      if (!node.children) return;
      node.children = node.children.map((child): RootContent => {
        if (child.type === 'element') walk(child);
        if (child.type === 'element' && child.tagName === 'table') {
          const wrapper: Element = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['um-table-scroll'] },
            children: [child],
          };
          return wrapper;
        }
        return child;
      });
    };
    walk(tree);
  };
}

// KaTeX's stylesheet is loaded globally from app/globals.css, so it is not
// imported here: Next only accepts global CSS imports from inside app/.
export function renderMarkdownWithMath(markdown: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeScrollableTables)
    .use(rehypeStringify)
    .processSync(markdown);

  return String(result);
}

// The answer key markdown carries fenced json blocks holding distractor_logic
// and misconception_tag. Those are authoring metadata, not study material:
// rendered verbatim they dump raw JSON into the student's answer key, and they
// expose the internal misconception taxonomy. Stripped before rendering so the
// tag data can grow without ever reaching the page.
export function stripAuthoringBlocks(markdown: string): string {
  return markdown.replace(/```json\n[\s\S]*?\n```\n?/g, '');
}

// Same pipeline, but for a fragment that has to sit inline -- a question stem
// or a single answer choice like "$4$ cups". remark always wraps a lone
// fragment in a paragraph, which would force a line break inside a label, so
// that wrapper is unwrapped again. Anything that genuinely parsed to multiple
// blocks is left alone rather than mangled.
export function renderInlineWithMath(markdown: string): string {
  const html = renderMarkdownWithMath(markdown).trim();
  const single = html.match(/^<p>([\s\S]*)<\/p>$/);
  return single && !single[1].includes('<p>') ? single[1] : html;
}

// One worked solution, split out of the Part 4 blob so it can be revealed on
// its own row instead of only inside the all-or-nothing answer key panel.
export type AnswerKeyEntry = {
  item_number: number;
  // The question restated, as the accordion row's label. Rendered inline
  // because these stems carry math.
  label_html: string;
  solution_html: string;
};

export type AnswerKeyEntries = {
  practice: AnswerKeyEntry[];
  mini_quiz: AnswerKeyEntry[];
};

// Part 4 holds both sections back to back under their own headings, each with
// its own item header shape. These mirror the regexes the upload parser uses
// to read correct answers out of the same text (see
// curriculum/migrations/upload_curriculum.py), so the item numbers here line
// up with the item_number on every parsed practice item.
const MINI_QUIZ_HEADING = /^#{3,6}\s*Mini Quiz/m;
const PRACTICE_KEY_RE = /^\*\*(\d+)\.[ \t]*(.*)$/gm;
const QUIZ_KEY_RE = /^\*\*Item (\d+):[ \t]*(.*)$/gm;

// Level banners and sub-headings sit between items, so they land at the tail of
// the previous item's body. The practice cards already carry their own level,
// and a heading dangling under a worked solution reads as part of it.
const STRAY_HEADING_RE = /^(?:#{1,6}\s.*|\*\*\w+ Level\*\*)\s*$/gm;

function splitSection(text: string, headerRe: RegExp): AnswerKeyEntry[] {
  const matches = [...text.matchAll(headerRe)];

  return matches.map((match, i) => {
    const start = match.index! + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const body = text
      .slice(start, end)
      .replace(STRAY_HEADING_RE, '')
      .trim();

    return {
      item_number: Number(match[1]),
      // The heading line runs to the closing `**` of the bold stem.
      label_html: renderInlineWithMath(match[2].replace(/\*\*\s*$/, '').trim()),
      solution_html: renderMarkdownWithMath(body),
    };
  });
}

// Splits Part 4 into one entry per item. Returns empty lists for any section it
// cannot parse -- a topic uploaded under an older content shape, say -- and the
// caller falls back to rendering the whole blob.
export function splitAnswerKey(raw: string): AnswerKeyEntries {
  const text = stripAuthoringBlocks(raw || '');
  if (!text.trim()) return { practice: [], mini_quiz: [] };

  const at = text.search(MINI_QUIZ_HEADING);
  const practiceText = at === -1 ? text : text.slice(0, at);
  const quizText = at === -1 ? '' : text.slice(at);

  return {
    practice: splitSection(practiceText, PRACTICE_KEY_RE),
    mini_quiz: splitSection(quizText, QUIZ_KEY_RE),
  };
}
