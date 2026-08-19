import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import type { Element, Parent, Root, RootContent } from 'hast';
// The one definition of where a lesson section starts, shared with the topic
// overview so the two surfaces can never report different counts for the same
// topic. It lives there rather than here because it must stay dependency-free:
// `node --test` loads it directly, and this module pulls in the whole remark
// pipeline.
import { splitLessonSections } from '@/app/lib/lesson-sections';

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

// One section of the guided notes, ready to render.
export type LessonSection = {
  // The heading as plain text, for the outline's title attribute. Attributes
  // cannot hold markup, so the eight headings carrying inline math have their $
  // delimiters stripped rather than being KaTeX in a tooltip.
  title: string;
  // The same heading rendered, so those eight set their math properly.
  heading_html: string;
  // The section's body, with the h5 removed: the heading is a real element in
  // the page now, not a line of prose inside the card.
  html: string;
};

// Splits guided notes into one rendered entry per authored h5, the same shape
// splitAnswerKey has: one stored blob in, a list of rendered pieces out, an empty
// list when it cannot parse and the caller falls back to the whole blob.
//
// THE MARKDOWN IS SPLIT, NOT THE RENDERED HTML. Splitting the output string would
// need an HTML parser and could cut a <div class="um-table-scroll"> in half.
// Splitting the source and rendering each piece keeps remark and KaTeX state
// per-section, and rehypeScrollableTables only ever walks its own tree.
//
// Where the section boundary comes from is settled: the authored h5, not the
// horizontal rules. See the note in app/lib/lesson-sections.ts.
export function splitGuidedNotes(raw: string | null | undefined): LessonSection[] {
  return splitLessonSections(raw).map((section) => ({
    title: section.heading.replace(/\$([^$]*)\$/g, '$1'),
    heading_html: renderInlineWithMath(section.heading),
    html: renderMarkdownWithMath(section.body),
  }));
}

// ── Distractor prose ────────────────────────────────────────────────────────

// One answer choice's teacher-facing explanation, unwrapped.
export type DistractorProse = {
  // The misconception slug, or null on the correct option and on anything that
  // did not parse. The same taxonomy misconception_tags carries.
  slug: string | null;
  // True for the "Correct: ..." entry. The answer key uses this to place the
  // line beside the right answer rather than under a wrong one.
  correct: boolean;
  // The sentence to show. Wrapper removed on a recognised entry, and the whole
  // trimmed string on anything else.
  text: string;
};

// The authored shape, which holds for all 4,032 wrong-answer entries across the
// 96 source files that carry a distractor_logic block:
//
//   Student makes misconception: adds_instead_of_subtracts (adds the 9 to 14
//   instead of subtracting it, producing 23)
//
// ANCHORED TO THE END, and that anchor is the load-bearing part. 184 of those
// 4,032 strings contain parentheses OF THEIR OWN -- "reads f(9) as f divided by
// 9", "though f(-2) is 21, not -3" -- and the trailing `\)\s*$` is what carries
// the match past them to the final ")".
//
// Measured, because the obvious version of this note is wrong: greediness is
// NOT what does the work. With the anchor present, a lazy `(.*?)` backtracks
// forward and returns exactly the same string as `(.*)`. The two ways to
// actually break it are:
//
//   `\(([^)]*)\)\s*$`   fails to match at all -- the class cannot cross the
//                       inner ")". Content survives, via the raw-string branch
//                       below, but the teacher reads the wrapper.
//   `\((.*?)\)`         drop the anchor and it MATCHES, returning "...so f(9".
//                       A truncated sentence that still reads like a finished
//                       thought, so the bug ships looking like content.
//
// tests/distractor-prose.test.ts pins all three behaviours.
//
// The `s` flag is deliberate too: a future multi-line entry would otherwise
// fail to match and fall through to the raw-string branch below.
// [\s\S] rather than `.` with the `s` flag: tsconfig targets ES2017 and the
// dotAll flag is ES2018. Same meaning, and it keeps a two-function addition
// from dragging the whole project's compile target along with it.
const WRONG_PROSE_RE = /^Student makes misconception:\s*([a-z0-9_]+)\s*\(([\s\S]*)\)\s*$/;
const CORRECT_PROSE_RE = /^Correct:\s*([\s\S]+)$/;

/**
 * Unwrap one stored distractor_prose entry for display.
 *
 * The database stores exactly what the author wrote, wrapper and all -- see
 * sql/curriculum_prose_columns.sql for why the strip is not done at upload.
 * This is where it comes off.
 *
 * NEVER DROPS CONTENT. An entry that matches neither shape comes back whole, as
 * `text`, with a null slug. The alternative -- returning null and letting the
 * caller render nothing -- turns an unrecognised sentence into a blank space on
 * a printed answer key, where the teacher has no way to tell a missing
 * explanation from one that never existed. A slightly ugly line is strictly
 * better than a silent hole.
 */
export function extractDistractorProse(
  raw: string | null | undefined,
): DistractorProse | null {
  const text = (raw ?? '').trim();
  if (!text) return null;

  const wrong = WRONG_PROSE_RE.exec(text);
  if (wrong) {
    return { slug: wrong[1], correct: false, text: wrong[2].trim() };
  }

  const right = CORRECT_PROSE_RE.exec(text);
  if (right) {
    return { slug: null, correct: true, text: right[1].trim() };
  }

  return { slug: null, correct: false, text };
}

/**
 * The answer key's per-option line: "Chose A: <explanation>".
 *
 * Third person singular is left exactly as authored ("adds the 9 to 14"), not
 * rewritten to agree with a plural subject. Fixing that is a cosmetic pass over
 * 4,032 strings and is not worth touching the content for; "Chose A:" reads
 * correctly with the singular anyway.
 */
export function distractorLine(
  letter: string,
  raw: string | null | undefined,
): string | null {
  const parsed = extractDistractorProse(raw);
  if (!parsed) return null;
  return `${parsed.correct ? 'Correct' : `Chose ${letter}`}: ${parsed.text}`;
}
