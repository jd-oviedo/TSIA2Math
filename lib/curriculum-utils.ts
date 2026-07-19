import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

// KaTeX's stylesheet is loaded globally from app/globals.css, so it is not
// imported here: Next only accepts global CSS imports from inside app/.
export function renderMarkdownWithMath(markdown: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
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
