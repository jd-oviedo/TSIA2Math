import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Renders a topic from its source markdown instead of from Supabase, so a
// figure or a display-math block can be checked in a real browser on the real
// route BEFORE the content is uploaded to production.
//
// Why this exists: the topic route reads exclusively from Supabase, so until a
// topic is live there is nothing to look at. That put Playwright after the
// upload, which means a rendering defect is found after students could already
// have seen it. This moves the rendering check in front of the upload.
//
// What it deliberately does NOT do: replace the post-upload Playwright pass.
// This path skips the view projection, the column list PostgREST accepts, RLS,
// the grants, and the JSON round-trip through Postgres. Every one of those is a
// real source of defects -- issue #84 is exactly one of them -- and none of them
// are exercised here. Rendering is the only thing this proves, because rendering
// is the only thing downstream of it.
//
// The fidelity claim is verified, not asserted: scripts/verify_fixture_parity.mjs
// renders a live topic through both paths and diffs the HTML byte for byte.

const FIXTURE_ENV = 'CURRICULUM_FIXTURE_SOURCE';

/**
 * The production leak guard.
 *
 * This module hands back a topic row that has never been through
 * curriculum_topics_public. That view is the only thing standing between an
 * anonymous visitor and correct_answer / misconception_tag, and it was hardened
 * in June precisely so that withholding answers stopped being something the
 * page code had to remember to do. Serving a row that bypassed it is the worst
 * failure available in this codebase.
 *
 * So the guard is a throw, not a conditional. A conditional inside loadTopic
 * degrades quietly when it is wrong; a misconfigured deploy would keep serving
 * pages and simply start including answers. Throwing at module load takes the
 * build down instead, which is loud, immediate, and impossible to miss.
 *
 * ── Why the condition is VERCEL_ENV and not NODE_ENV ────────────────────────
 *
 * This looks looser than a plain `NODE_ENV === 'production'` check. It is not,
 * and it was not weakened to make a test pass. NODE_ENV answers "is this a
 * production *build*", which is a different question from "is this a production
 * *deployment*", and the two diverge exactly where it matters:
 *
 *   `next start` on a laptop sets NODE_ENV=production. It is a production build
 *   and it is not a deployment.
 *
 * Gating on NODE_ENV therefore bans the fixture from the only server mode this
 * project is allowed to run Playwright against -- `next build && next start`,
 * because `next dev` crashes the box under Playwright load and surfaces as
 * false 404s. The feature would have been unusable by the verification it exists
 * to serve, which is how the mistake was found.
 *
 * VERCEL_ENV is set on every Vercel deploy, production and preview alike, and
 * on no local machine. It is already the established sentinel for this exact
 * distinction here -- see sentry.server.config.ts:14, "VERCEL_ENV distinguishes
 * production vs preview deploys (both build with NODE_ENV=production)".
 *
 * Any deploy is refused, preview included. A preview deploy is reachable by
 * anyone with the URL, so it is no safer a place to serve unstripped rows than
 * production is.
 *
 * Residual gap, named so it is not rediscovered the hard way: if this app is
 * ever hosted somewhere that does not set VERCEL_ENV, this guard goes quiet and
 * needs a sentinel for that host added here.
 *
 * Exported as a pure function of an env bag so the guard itself can be tested
 * rather than assumed. See tests/curriculum-fixture-guard.test.ts.
 */
export function assertFixtureSafe(env: Record<string, string | undefined>): void {
  const enabled = Boolean(env[FIXTURE_ENV]);
  if (enabled && Boolean(env.VERCEL_ENV)) {
    throw new Error(
      `${FIXTURE_ENV} is set on a deployed environment ` +
        `(VERCEL_ENV=${env.VERCEL_ENV}). Refusing to start.\n\n` +
        'This flag makes the topic route read curriculum from local markdown ' +
        'instead of from curriculum_topics_public. That view is what strips ' +
        'correct_answer and misconception_tag before anything reaches an ' +
        'anonymous student, so running with this flag on a deploy would ' +
        'serve answer keys to signed-out visitors.\n\n' +
        `Unset ${FIXTURE_ENV}. It is for local use only.`,
    );
  }
}

// Runs on import. topic-data.ts imports this module, so any build that would
// render a topic page runs the guard first.
assertFixtureSafe(process.env);

// Same sentinel as the guard above, for the same reason: gating on NODE_ENV
// here would switch the fixture off under `next start`, which is the only
// server mode Playwright is allowed to run against on this box.
export function isFixtureEnabled(): boolean {
  return Boolean(process.env[FIXTURE_ENV]) && !process.env.VERCEL_ENV;
}

// ─── Source parsing ──────────────────────────────────────────────────────────
//
// These mirror curriculum/migrations/upload_curriculum.py exactly. They are a
// second implementation of the same rules in a second language, which is a
// divergence risk, so it is not taken on trust: the parity script proves the
// HTML this produces is byte-identical to the HTML the uploaded row produces.

const CHOICE_RE = /^[ \t]*-[ \t]*([A-D])\)[ \t]*(.+?)[ \t]*$/gm;
const PRACTICE_STEM_RE = /^(\d+)\.[ \t]+/gm;
const QUIZ_STEM_RE = /^\*\*Item (\d+)\*\*/gm;
const PRACTICE_KEY_RE = /^\*\*(\d+)\./gm;
const QUIZ_KEY_RE = /^\*\*Item (\d+):/gm;
const LEVEL_RE = /^\*\*(\w+) Level\*\*/gm;
const ANSWER_RE = /^\*\*Answer:\s*([A-D])\*\*/m;
const JSON_BLOCK_RE = /```json\n[\s\S]*?\n```/g;

type Parsed = {
  metadata: Record<string, unknown>;
  guided_notes: string;
  practice_problems: string;
  mini_quiz: string;
  answer_key: string;
};

function parseSource(content: string): Parsed {
  let frontmatter = '';
  let body = content;
  if (content.startsWith('---')) {
    const parts = content.split('---');
    frontmatter = parts[1] ?? '';
    body = parts.slice(2).join('---');
  }

  const metadata: Record<string, unknown> = {};
  for (const line of frontmatter.trim().split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        metadata[key] = JSON.parse(val);
      } catch {
        metadata[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
      metadata[key] = val.toLowerCase() === 'true';
    } else if (/^\d+$/.test(val)) {
      metadata[key] = parseInt(val, 10);
    } else {
      metadata[key] = val.replace(/^["']|["']$/g, '');
    }
  }

  // Part headings switch which bucket subsequent lines land in, exactly as the
  // uploader does it.
  const sections: Record<string, string> = {};
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current) sections[current] = buf.join('\n').trim();
  };
  for (const line of body.split('\n')) {
    if (line.startsWith('#### **Part 1:')) { flush(); current = 'guided_notes'; buf = []; }
    else if (line.startsWith('#### **Part 2:')) { flush(); current = 'practice_problems'; buf = []; }
    else if (line.startsWith('#### **Part 3:')) { flush(); current = 'mini_quiz'; buf = []; }
    else if (line.startsWith('#### **Part 4:')) { flush(); current = 'answer_key'; buf = []; }
    else if (current) buf.push(line);
  }
  flush();

  return {
    metadata,
    guided_notes: sections.guided_notes ?? '',
    practice_problems: sections.practice_problems ?? '',
    mini_quiz: sections.mini_quiz ?? '',
    answer_key: sections.answer_key ?? '',
  };
}

function splitItems(text: string, re: RegExp): Array<[string, string]> {
  const matches = [...(text || '').matchAll(new RegExp(re.source, re.flags))];
  return matches.map((m, i) => {
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    return [m[1], text.slice(m.index! + m[0].length, end)] as [string, string];
  });
}

function parseStemAndChoices(body: string): [string, Record<string, string>] {
  const choices: Record<string, string> = {};
  const re = new RegExp(CHOICE_RE.source, CHOICE_RE.flags);
  let first = -1;
  for (const m of body.matchAll(re)) {
    if (first === -1) first = m.index!;
    choices[m[1]] = m[2];
  }
  let stem = first === -1 ? body : body.slice(0, first);
  stem = stem.replaceAll('---', ' ').trim().replace(/\s*\n\s*/g, ' ').trim();
  return [stem, choices];
}

type KeyEntry = { correct: string | null; tags: Record<string, string> };

function parseAnswerKey(answerKey: string): Record<string, Record<string, KeyEntry>> {
  const result: Record<string, Record<string, KeyEntry>> = { practice: {}, mini_quiz: {} };
  if (!answerKey) return result;

  const split = answerKey.split(/^#####\s*Mini Quiz/m);
  const sections: Array<[string, string, RegExp]> = [['practice', split[0], PRACTICE_KEY_RE]];
  if (split.length > 1) sections.push(['mini_quiz', split.slice(1).join(''), QUIZ_KEY_RE]);

  for (const [name, text, re] of sections) {
    for (const [num, body] of splitItems(text, re)) {
      const answer = ANSWER_RE.exec(body);
      const tags: Record<string, string> = {};
      const block = /"misconception_tag":\s*\{([\s\S]*?)\}/.exec(body);
      if (block) {
        for (const m of block[1].matchAll(/"([A-Z])":\s*"([a-z0-9_]+)"/g)) tags[m[1]] = m[2];
      }
      result[name][num] = { correct: answer ? answer[1] : null, tags };
    }
  }
  return result;
}

type BuiltItem = {
  item_number: number;
  format: 'multiple_choice' | 'free_response';
  stem: string;
  choices: Record<string, string>;
  level: string | null;
};

function buildPracticeItems(parsed: Parsed) {
  const key = parseAnswerKey(parsed.answer_key);
  const out: Record<string, { interactive: boolean; items: BuiltItem[] }> = {};

  const sources: Array<[string, string, RegExp]> = [
    ['practice', parsed.practice_problems, PRACTICE_STEM_RE],
    ['mini_quiz', parsed.mini_quiz, QUIZ_STEM_RE],
  ];

  for (const [name, source, stemRe] of sources) {
    const text = (source || '').replace(JSON_BLOCK_RE, '');
    const levels = [...text.matchAll(new RegExp(LEVEL_RE.source, LEVEL_RE.flags))]
      .map((m) => [m.index!, m[1]] as [number, string]);
    const starts = [...text.matchAll(new RegExp(stemRe.source, stemRe.flags))].map((m) => m.index!);

    const items: BuiltItem[] = [];
    let interactive = true;
    splitItems(text, stemRe).forEach(([num, body], i) => {
      const [stem, choices] = parseStemAndChoices(body);
      const entry = key[name]?.[num];
      let level: string | null = null;
      for (const [pos, label] of levels) if (pos < starts[i]) level = label;

      const format = Object.keys(choices).length ? 'multiple_choice' : 'free_response';
      // interactive is computed from the answers, then the answers are dropped
      // below -- same order as the uploader, whose row is what the view strips.
      if (format !== 'multiple_choice' || !entry?.correct) interactive = false;

      items.push({ item_number: parseInt(num, 10), format, stem, choices, level });
    });

    out[name] = { interactive: items.length > 0 && interactive, items };
  }
  return out;
}

// ─── Public entry point ──────────────────────────────────────────────────────

export type FixtureTopic = {
  topic_id: string;
  topic_name: string;
  is_placeholder: boolean;
  related_strand: string;
  estimated_time_minutes: number;
  guided_notes: string;
  practice_items: ReturnType<typeof buildPracticeItems>;
  practice_problems: { raw: string };
  mini_quiz: { raw: string };
};

function findSource(courseId: string, topicId: string): string | null {
  const root = join(process.cwd(), 'curriculum', 'source', courseId);
  if (!existsSync(root)) return null;
  for (const dir of readdirSync(root)) {
    if (!dir.startsWith('unit-')) continue;
    const candidate = join(root, dir, `${topicId}.md`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * The row the topic route would have got from curriculum_topics_public, built
 * from the source markdown instead.
 *
 * Returns the PUBLIC shape only. correct_answer and misconception_tag are never
 * attached, and answer_key is not returned at all, so this mirrors what the
 * view exposes rather than what the base table holds. A teacher page rendered
 * through this path therefore has no answer key, which is correct: this exists
 * to check rendering, not to stand in for the privileged read.
 *
 * Reads and parses on every call. Nothing is cached to disk and no parsed copy
 * is checked in, so the fixture cannot drift from the source file it is derived
 * from -- if the markdown changes, the next request sees the change.
 */
export function loadTopicFixture(courseId: string, topicId: string): FixtureTopic | null {
  if (!isFixtureEnabled()) return null;
  const path = findSource(courseId, topicId);
  if (!path) return null;

  const parsed = parseSource(readFileSync(path, 'utf-8'));
  const meta = parsed.metadata;

  return {
    topic_id: topicId,
    topic_name: (meta.topic_name as string) ?? topicId,
    is_placeholder: false,
    related_strand: (meta.related_strand as string) ?? '',
    estimated_time_minutes: (meta.estimated_time_minutes as number) ?? 45,
    guided_notes: parsed.guided_notes,
    practice_items: buildPracticeItems(parsed),
    practice_problems: { raw: parsed.practice_problems },
    mini_quiz: { raw: parsed.mini_quiz },
  };
}
