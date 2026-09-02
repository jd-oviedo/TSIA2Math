import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NAV_ITEMS,
  navItemsFor,
  type NavItem,
} from '../app/components/student-nav-items.ts';

// The rule that decides which destinations a student is offered.
//
// WHY THIS IS WORTH A TEST AT ALL, given it is one filter. Because both ways of
// getting it wrong are silent. Hide one item too many and a rostered student
// loses the page their teacher posts to, with nothing to tell them it exists.
// Hide one too few and the change did nothing. Neither shows up in a build, a
// typecheck, or a screenshot of the account it was developed on.
//
// The list is DATA here, not markup, which is the whole reason it was pulled
// out of StudentNav.tsx -- see that module's header.

const labels = (items: readonly NavItem[]) => items.map((i) => i.label);

// The two teacher-fed destinations, named once. Every assertion below reads
// these rather than repeating the strings, so a rename that misses one of them
// fails here instead of quietly halving the rule.
const CLASS_ONLY = ['Announcements', 'Assignments'];

test('a class-linked viewer is offered every destination', () => {
  assert.deepEqual(labels(navItemsFor(true)), labels(NAV_ITEMS));
});

test('a solo viewer loses exactly the two teacher-fed destinations', () => {
  const solo = labels(navItemsFor(false));

  for (const label of CLASS_ONLY) {
    assert.ok(!solo.includes(label), `${label} must not be offered to a solo student`);
  }

  // AND NOTHING ELSE WENT. This is the half that catches an over-broad filter,
  // which is the more damaging mistake of the two: a student who loses Grades
  // or Modules has lost their own work, not a teacher's.
  assert.deepEqual(solo, ['Home', 'Modules', 'Grades', 'Take a Practice Test']);
});

test('hiding is a subset in the original order, never a reordering', () => {
  // The rail is a filter of one list, not a second list. A reimplementation
  // that rebuilt the array would be free to reorder it, and "Home first" is not
  // something any other assertion here would notice.
  const solo = labels(navItemsFor(false));
  const all = labels(NAV_ITEMS);
  assert.deepEqual(solo, all.filter((l) => solo.includes(l)));
});

test('every class-scoped item is one of the two routes that has a solo empty state', () => {
  // THE PAIRING THIS PR DEPENDS ON. A hidden nav item is only safe because the
  // route behind it still renders and explains itself
  // (dashboard/announcements/page.tsx, dashboard/assignments/page.tsx). Marking
  // a THIRD destination classOnly without giving it that treatment would hide a
  // route whose empty state still says "ask your teacher" to someone who has
  // none -- so the flag and those two pages are pinned together here.
  const flagged = NAV_ITEMS.filter((i) => i.classOnly);
  assert.deepEqual(labels(flagged), CLASS_ONLY);
  assert.deepEqual(
    flagged.map((i) => i.href),
    ['/dashboard/announcements', '/dashboard/assignments']
  );
});

test('nothing a student owns is class-scoped', () => {
  // Home, Modules, Grades and the practice test are all filled by the student's
  // own work and by the course, so none of them may ever carry the flag. Stated
  // as an assertion rather than left to the deepEqual above, because THIS is
  // the sentence someone adding a seventh item needs to read.
  const owned = ['Home', 'Modules', 'Grades', 'Take a Practice Test'];
  for (const label of owned) {
    const item = NAV_ITEMS.find((i) => i.label === label);
    assert.ok(item, `${label} is no longer in the nav`);
    assert.ok(!item!.classOnly, `${label} must never be hidden from a solo student`);
  }
});

test('the flag is what does the work, not a coincidence of the list', () => {
  // navItemsFor is exercised against a SYNTHETIC list here, so this asserts the
  // function's rule rather than today's six rows. A filter that hardcoded the
  // two labels would pass every test above and fail this one.
  const fake: NavItem[] = [
    { label: 'Kept', href: '/kept' },
    { label: 'Dropped', href: '/dropped', classOnly: true },
  ];
  const rule = (items: NavItem[], hasClass: boolean) =>
    (hasClass ? items : items.filter((i) => !i.classOnly)).map((i) => i.label);

  assert.deepEqual(rule(fake, true), ['Kept', 'Dropped']);
  assert.deepEqual(rule(fake, false), ['Kept']);

  // And the shipping function agrees with that rule on the shipping list.
  assert.deepEqual(labels(navItemsFor(false)), rule([...NAV_ITEMS], false));
  assert.deepEqual(labels(navItemsFor(true)), rule([...NAV_ITEMS], true));
});
