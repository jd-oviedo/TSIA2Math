import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// THE STATIC HALF OF THE SHELL SPACING PROOF.
//
// scripts/verify_shell_spacing.mjs renders the primitives and the prop-driven
// panels in the DB-free lane and measures the real boxes, in both themes. What
// it cannot reach is the three page BODIES: Home, Grades and Announcements are
// async server components that call getProfile() and read Supabase, so they
// cannot be mounted without a database and are not mounted.
//
// That leaves one way for the scale to come apart that a rendered check would
// never see: a page quietly writing `gap: 12` on its own stack again. Every one
// of the five shell pages had done exactly that -- 16, 18, 12, 12 and 22, five
// files, five numbers, none of them meaning anything -- and nothing in the
// repository objected, because each was locally reasonable.
//
// So this is the assertion the rendered check cannot make: in the shell's page
// and panel files, a VERTICAL STACK may not carry a hand-written gap. It must
// come from SPACING.
//
// WHY THE THRESHOLD IS TEN. Section stacks in this shell sit at 14 and above;
// the gaps left as literals are intra-block spacing -- a heading against its own
// blurb at 8, an announcement title against its own body at 6 -- which are not
// part of the scale and were never meant to be. Ten is the line between the two
// and is stated here rather than left implicit. A stack that drifts back to 12
// reddens; a 6px pair inside one block does not.

/**
 * SPACING, read out of the SOURCE rather than imported.
 *
 * Not a workaround, though it started as one -- node --test cannot load a .tsx
 * (its type-stripping does not do JSX), and ui.tsx renders components. Reading
 * the text is the better check anyway: this file is a drift guard, and a drift
 * guard that imports the module under test asserts against whatever that module
 * currently evaluates to. The point is the literal on disk.
 */
function readSpacing(): Record<string, string | number> {
  const src = readFileSync('app/dashboard/ui.tsx', 'utf8');
  const block = src.match(/export const SPACING = \{([\s\S]*?)\} as const;/);
  assert.ok(block, 'SPACING is no longer declared in app/dashboard/ui.tsx');
  const out: Record<string, string | number> = {};
  for (const line of block![1].split('\n')) {
    const m = line.match(/^\s*([A-Z_]+):\s*(.+?),\s*$/);
    if (!m) continue;
    const raw = m[2].trim();
    out[m[1]] = raw.startsWith("'") ? raw.slice(1, -1) : Number(raw);
  }
  return out;
}

const SCOPE = [
  'app/dashboard/page.tsx',
  'app/dashboard/grades/page.tsx',
  'app/dashboard/announcements/page.tsx',
  'app/dashboard/assignments/page.tsx',
  'app/dashboard/assignments/AssignmentsList.tsx',
  'app/dashboard/AssignmentsHomeCard.tsx',
  'app/dashboard/JoinClassPanel.tsx',
  'app/dashboard/DiagnosticCta.tsx',
];

/** The lowest gap that counts as structure rather than as intra-block spacing. */
const STACK_FLOOR = 10;

/**
 * Every `style={{ ... }}` object in a source file, as raw text.
 *
 * Brace-matched rather than regexed to a closing `}`, because these objects hold
 * nested template literals and ternaries and a lazy match stops at the first one
 * -- which would silently shorten the window a gap has to be found in, and a
 * check that silently looks at less than it claims to is worse than none.
 */
function styleObjects(src: string): string[] {
  const out: string[] = [];
  const OPEN = 'style={{';
  let i = src.indexOf(OPEN);
  while (i !== -1) {
    let depth = 0;
    let j = i + OPEN.length - 2; // sit on the first '{' of the object literal
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    out.push(src.slice(i, j + 1));
    i = src.indexOf(OPEN, j + 1);
  }
  return out;
}

test('the shell spacing scale holds the approved values', () => {
  const SPACING = readSpacing();

  // The gate's numbers, restated so that editing ui.tsx alone cannot move them
  // quietly. This is the same oracle scripts/verify_shell_spacing.mjs asserts
  // against the rendered page; the two must agree or one of them is lying.
  assert.equal(SPACING.STACK, 16);
  assert.equal(SPACING.GROUP, 28);
  assert.equal(SPACING.PANEL_PAD, '22px 24px');
  assert.equal(SPACING.BLOCK, 14);
  assert.equal(SPACING.HEAD_GAP, 10);

  // GROUP is the only value that was not already on screen, and it earns its
  // place by being bigger than STACK. If the two ever meet, the hierarchy this
  // whole pass added is gone and every page is flat again.
  assert.ok(
    SPACING.GROUP > SPACING.STACK,
    'GROUP must stay larger than STACK or group seams stop reading as seams',
  );
});

test('no shell page writes a literal gap on a vertical stack', () => {
  const offenders: string[] = [];

  for (const file of SCOPE) {
    const src = readFileSync(file, 'utf8');
    for (const obj of styleObjects(src)) {
      if (!obj.includes("flexDirection: 'column'")) continue;
      const gap = obj.match(/\bgap:\s*([^,\n}]+)/);
      if (!gap) continue;

      const value = gap[1].trim();
      if (value.startsWith('SPACING.')) continue;

      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric < STACK_FLOOR) continue;

      offenders.push(`${file}: gap: ${value}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'A vertical stack in the shell is carrying a hand-written gap. Section ' +
      'spacing comes from SPACING in app/dashboard/ui.tsx -- use SPACING.STACK, ' +
      'SPACING.GROUP or SPACING.BLOCK, or use the PageStack / SectionGroup ' +
      'primitives, so the five pages cannot drift apart again.',
  );
});

test('no shell page hands Card a literal padding', () => {
  // The panel padding was 22/24, 26/28, 20/22 and 16/24 across four files. Only
  // DiagnosticCta is allowed off the scale now, and its exemption is written
  // down in the component rather than assumed here: it is the "louder than the
  // cards below it" card, and it is not a <Card> at all, so a literal padding
  // passed to the primitive is always drift.
  //
  // ZERO IS THE ONE EXCEPTION, AND IT IS NOT A LOOPHOLE. A panel whose children
  // carry their own padding must have none of its own, or the two stack: the
  // Assignments list is rows at 14/18 inside a panel, and PANEL_PAD there would
  // inset every row by a second 22/24. That is the absence of a spacing value,
  // not a competing one, which is the whole distinction this test exists to
  // police -- and app/dashboard/settings/page.tsx:34 has shipped it since that
  // page was written. Any other literal still reddens, including "0px" and
  // "0 0": the exemption is the exact string, so a padding that grows a unit
  // has to come back through here.
  const offenders: string[] = [];

  for (const file of SCOPE) {
    const src = readFileSync(file, 'utf8');
    for (const match of src.matchAll(/<Card\s+padding=(\{[^}]*\}|"[^"]*")/g)) {
      const value = match[1];
      if (value.includes('SPACING.PANEL_PAD')) continue;
      if (value === '"0"') continue;
      offenders.push(`${file}: <Card padding=${value}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'A shell page is passing Card a hand-written padding. Panel padding is ' +
      'SPACING.PANEL_PAD; Card already defaults to it, so the prop should ' +
      'usually be dropped entirely.',
  );
});

test('the shell pages consume the stack primitives rather than rolling their own', () => {
  // The complement of the gap check above. A page could satisfy that one by
  // writing `gap: SPACING.GROUP` on a bespoke div, which would be correct today
  // and would drift the moment the primitive grows a behaviour the div lacks.
  const pages = [
    'app/dashboard/page.tsx',
    'app/dashboard/grades/page.tsx',
    'app/dashboard/announcements/page.tsx',
    'app/dashboard/assignments/AssignmentsList.tsx',
  ];

  for (const file of pages) {
    const src = readFileSync(file, 'utf8');
    assert.ok(
      src.includes('<PageStack>') || src.includes('<SectionGroup>'),
      `${file} builds its own panel column instead of using PageStack / SectionGroup`,
    );
  }
});
