import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// THE STATIC HALF OF THE MASCOT SWAP PROOF.
//
// scripts/verify_mu_avatar.mjs mounts the real GumuAvatar in the DB-free lane
// at all four configurations and proves, in both themes, that the new asset
// DECODES, that no plate renders, and that the grounds did not move.
//
// What it cannot reach is the four call sites. quiz/page.tsx and
// practice/page.tsx are async server components and GumuChat reads a topic, so
// none of the three files can be mounted without a database, and agent-run
// checks never touch prod. That leaves three ways for this swap to come apart
// that a rendered check would never see:
//
//   1. a call site going back to `plate`, which would restore the worst
//      available ground for the mark while the lane kept passing forever,
//   2. the swap being done by RENAMING, which is the one thing it must not be:
//      "gumu" appears 396 times in this repo and collides with the greek-mu
//      brand mark and with code substrings, and
//   3. the old asset coming back, by path or by file.
//
// All three are text facts about files on disk, so all three are asserted as
// text.

const AVATAR = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuAvatar.tsx';
const CHAT = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuChat.tsx';
const PRACTICE = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/practice/page.tsx';
const QUIZ = 'app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/quiz/page.tsx';
const THEME = 'app/components/curriculum-theme.ts';

const NEW_ASSET = 'public/images/Mu-trimmed-transparent.png';
const OLD_ASSET = 'public/images/GUMU_headshot_transparent.png';

/**
 * A source file with its comments removed.
 *
 * THESE ASSERTIONS ARE ABOUT CODE, AND THE PROSE IS NOT CODE. GumuAvatar.tsx
 * documents this swap BY NAMING WHAT IT REMOVED -- the old filename, the plate,
 * C.gumuSurface and the measurements that condemned it -- because a reader who
 * finds a cream plate in a future diff should be able to learn from that comment
 * why it is wrong. A raw substring scan reads that explanation as a violation
 * and reddens on the documentation, which would leave exactly two options:
 * delete the explanation, or delete the check. Strip the comments instead.
 *
 * Block comments first, so a `//` inside one is already gone; then line
 * comments, ignoring `://` so a URL never truncates a line of real code.
 */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

// ─── The asset itself ────────────────────────────────────────────────────────

test('the new asset is committed and the old one is gone from disk', () => {
  assert.ok(existsSync(NEW_ASSET), `${NEW_ASSET} is missing`);
  assert.ok(!existsSync(OLD_ASSET), `${OLD_ASSET} should have been deleted`);
});

test('GumuAvatar points at the new asset and never at the old one', () => {
  const src = code(AVATAR);
  assert.match(src, /const SRC = '\/images\/Mu-trimmed-transparent\.png'/);
  assert.ok(
    !src.includes('GUMU_headshot_transparent'),
    'GumuAvatar still names the deleted asset in code',
  );
});

// Scans code, not docs. phase-1-curriculum-visual-redesign.md names the old file
// at :726 and is left alone on purpose: it is an investigation record dated
// 2026-08-21 whose own header says it changed no product code, so it documents
// what was true then rather than what should be true now.
//
// The two proof files are excluded BY NAME rather than by directory, and the
// distinction matters. Both name the old asset because naming it is their job:
// this file asserts its absence and the verifier asserts no <img> resolves to
// it. Skipping all of tests/ and scripts/ instead would let a real reference
// hide in either directory, which is the failure this check exists to catch --
// it caught these two on its first run.
const PROOF_FILES = ['scripts/verify_mu_avatar.mjs', 'tests/mu-avatar.test.ts'];

test('nothing in the codebase references the deleted asset path', () => {
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(tsx?|mjs|js|css|json)$/.test(entry)) {
        if (PROOF_FILES.includes(full)) continue;
        if (readFileSync(full, 'utf8').includes('GUMU_headshot_transparent')) offenders.push(full);
      }
    }
  };
  for (const root of ['app', 'components', 'lib', 'scripts', 'tests', 'public']) {
    if (existsSync(root)) walk(root);
  }
  assert.deepEqual(offenders, [], `these still name the deleted asset: ${offenders.join(', ')}`);
});

// ─── The plate, which is the visual decision this PR turned on ───────────────

test('GumuAvatar has no plate: no prop, no branch, no cream fill', () => {
  const src = code(AVATAR);
  assert.ok(!/\bplate\b/.test(src), 'the plate prop or branch is back in GumuAvatar');
  assert.ok(!src.includes('gumuSurface'), 'GumuAvatar consumes C.gumuSurface again');
});

test('no call site passes plate', () => {
  for (const file of [QUIZ, PRACTICE, CHAT]) {
    const calls = code(file).match(/<GumuAvatar[^/>]*\/>/g) ?? [];
    assert.ok(calls.length > 0, `${file} no longer renders GumuAvatar at all`);
    for (const call of calls) {
      assert.ok(!/\bplate\b/.test(call), `${file} passes plate again: ${call}`);
    }
  }
});

// C.gumuSurface keeps its definition even with no consumer:
// tests/curriculum-contrast.test.ts asserts it, and removing the token is a
// different decision from removing this one use of it.
test('C.gumuSurface is still defined in the theme', () => {
  assert.match(code(THEME), /gumuSurface: '#F7F1E4'/);
});

// ─── The four call sites, at the sizes the lane mounts ───────────────────────

test('all four call sites render GumuAvatar at the approved sizes', () => {
  assert.match(code(QUIZ), /<GumuAvatar size=\{64\} \/>/);
  assert.match(code(PRACTICE), /<GumuAvatar size=\{40\} title="" \/>/);
  assert.match(code(CHAT), /<GumuAvatar size=\{44\} title="" \/>/);
  assert.match(code(CHAT), /<GumuAvatar size=\{48\} \/>/);
});

test('the default accessible name is mu', () => {
  assert.match(code(AVATAR), /title = 'mu'/);
  assert.ok(!/title = 'GUMU'/.test(code(AVATAR)), "the default title is back to 'GUMU'");
});

// ─── The three visible strings ───────────────────────────────────────────────
//
// JSX text, not comments, so code() keeps them. These are the labels a student
// reads beside the mark; the identifiers below are what must NOT move with them.

test('the three student-visible labels say mu', () => {
  const chat = code(CHAT);
  assert.ok(chat.includes('>mu</div>'), 'the chat header label is not "mu"');
  assert.ok(chat.includes('mu is thinking'), 'the pending line is not "mu is thinking"');
  assert.ok(!chat.includes('>GUMU</div>'), 'the chat header label says GUMU again');
  assert.ok(!chat.includes('GUMU is thinking'), 'the pending line says GUMU again');

  const practice = code(PRACTICE);
  assert.ok(practice.includes('mu comes in on the mini quiz'), 'the practice line is not "mu"');
  assert.ok(!practice.includes('GUMU comes in'), 'the practice line says GUMU again');
});

// ─── NOTHING WAS RENAMED, which is the hard line this PR was given ───────────
//
// The swap is an asset, a src, an alt and a plate. Every identifier below
// collides with either the greek-mu brand mark or a code substring, and a
// find-replace across "gumu" would have hit 396 sites.

test('no identifier was renamed', () => {
  const avatar = code(AVATAR);
  assert.match(avatar, /export default function GumuAvatar\(/);

  const chat = code(CHAT);
  assert.match(chat, /import GumuAvatar from '\.\/GumuAvatar'/);
  assert.ok(chat.includes('um-gumu-panel'), '.um-gumu-panel was renamed');

  assert.match(code(QUIZ), /import GumuAvatar from '\.\.\/GumuAvatar'/);
  assert.ok(code(QUIZ).includes('um-gumu-card'), '.um-gumu-card was renamed');
  assert.match(code(PRACTICE), /import GumuAvatar from '\.\.\/GumuAvatar'/);

  const theme = code(THEME);
  assert.ok(theme.includes('gumuSurface:'), 'C.gumuSurface was renamed');
  assert.ok(theme.includes('gumuBanner:'), 'C.gumuBanner was renamed');
});

test('the GumuAvatar module file still exists under its own name', () => {
  assert.ok(existsSync(AVATAR), 'GumuAvatar.tsx was renamed or moved');
  assert.ok(existsSync(CHAT), 'GumuChat.tsx was renamed or moved');
  assert.ok(
    existsSync('app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/GumuGate.tsx'),
    'GumuGate.tsx was renamed or moved',
  );
});
