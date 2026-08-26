import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// THE STATIC HALF OF THE ANNOUNCEMENT PANEL PROOF.
//
// scripts/verify_announcements_card.mjs mounts the real AnnouncementCard in the
// DB-free lane and measures its radius, shadow, fill and tag in both themes.
// What it cannot reach is the PAGE: /dashboard/announcements is an async server
// component that calls getProfile() and reads Supabase, so it cannot be mounted
// without a database and is not mounted.
//
// That leaves two ways for this convergence to come apart that a rendered check
// would never see:
//
//   1. the page going back to its own <article> and leaving AnnouncementCard
//      mounted only in the lane, where it would keep passing forever, and
//   2. the literal coming back -- here or anywhere else on a panel surface.
//
// Both are text facts about files on disk, so both are asserted as text.

const PAGE = 'app/dashboard/announcements/page.tsx';
const CARD = 'app/dashboard/announcements/AnnouncementCard.tsx';
const UI = 'app/dashboard/ui.tsx';

/**
 * A source file with its comments removed.
 *
 * THESE ASSERTIONS ARE ABOUT CODE, AND THE PROSE IS NOT CODE. Every file this
 * test scans documents the defect it removed BY NAMING IT -- AnnouncementCard's
 * header quotes the deleted literal in full, because a reader who finds a
 * shadow literal in a future diff should be able to learn from that comment why
 * it is wrong. A raw substring scan reads that explanation as a violation and
 * reddens on the documentation, which would leave exactly two options: delete
 * the explanation, or delete the check. Strip the comments instead.
 *
 * Block comments first, so a `//` inside one is already gone; then line
 * comments, ignoring `://` so a URL never truncates a line of real code.
 */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

test('the announcements page renders AnnouncementCard rather than its own panel', () => {
  const src = code(PAGE);

  assert.ok(
    src.includes('<AnnouncementCard'),
    `${PAGE} no longer renders AnnouncementCard. The lane mounts that component, ` +
      'so a page that stops using it is unverified no matter how green the ' +
      'rendered check is.',
  );

  // The panel it used to hand-roll. An <article> here again means the page is
  // drawing its own box, which is the entire defect this PR removed.
  assert.ok(
    !src.includes('<article'),
    `${PAGE} is hand-rolling an <article> panel again. The panel is Card, via ` +
      'AnnouncementCard, which passes as="article" to keep the semantics.',
  );
});

test('the announcement panel takes its shape from Card, not from itself', () => {
  const src = code(CARD);

  assert.ok(
    src.includes('<Card as="article">'),
    `${CARD} must render <Card as="article">. Card supplies the radius, the ` +
      'border, the fill and the theme-aware shadow; `as` is what keeps the ' +
      'post navigable as a discrete article to a screen reader.',
  );

  // THE ONE PROPERTY THIS COMPONENT MAY NEVER DECLARE. A shadow here is a
  // panel shadow by definition -- nothing in an announcement's CONTENT casts
  // one -- so any boxShadow in this file is the deleted defect returning under
  // a new name, whether or not it is written as a literal.
  assert.ok(
    !src.includes('boxShadow'),
    `${CARD} declares a boxShadow. The panel's shadow is V.cardShadow, via ` +
      'Card, which is the only form that moves when the theme does.',
  );

  // The panel radius, specifically. The chip below it is a 999px pill and that
  // is a CONTENT shape, deliberately still declared here -- so this rules out
  // the two panel radii by value rather than banning the property outright.
  for (const bad of ['borderRadius: 12', 'borderRadius: 16']) {
    assert.ok(
      !src.includes(bad),
      `${CARD} declares ${bad}. The panel radius comes from cardStyle(); ` +
        'restating it here is how it drifted to 16 in the first place.',
    );
  }
});

test('the deleted shadow literal has not come back', () => {
  // The exact string removed by this PR. Checked across the shell rather than
  // in the two files above, because the defect class -- a shadow tuned against
  // a white card, written as a literal, unable to move when the theme does --
  // is not specific to announcements. #207 and #212 cleared the rest of it.
  const LITERAL = 'rgba(14,14,17,.05)';
  for (const file of [PAGE, CARD, UI, 'app/dashboard/page.tsx']) {
    assert.ok(
      !code(file).includes(LITERAL),
      `${file} contains the light-only shadow literal ${LITERAL} again. ` +
        'Panel shadows are V.cardShadow, which resolves per theme.',
    );
  }
});

test('Card still defaults to <section>, so no existing caller moved', () => {
  const src = code(UI);

  assert.ok(
    src.includes("as: Tag = 'section'"),
    `${UI}: Card's \`as\` prop must default to 'section'. Every caller that ` +
      'does not ask for otherwise renders the element it always rendered, and ' +
      'that default is the whole reason this prop was safe to add.',
  );

  // The prop is for semantics, not for style. A union of two element names
  // cannot become a hook for a caller to restyle a panel through.
  assert.ok(
    src.includes("as?: 'section' | 'article';"),
    `${UI}: Card's \`as\` prop must stay a two-element union. It exists so ` +
      'announcements can keep its <article> role, not as a general escape hatch.',
  );
});
