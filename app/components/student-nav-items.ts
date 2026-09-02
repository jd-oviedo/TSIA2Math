// The student nav's destinations, and the one rule that decides which of them a
// viewer is offered.
//
// RUNTIME-PURE ON PURPOSE, the same discipline as products.ts and
// capabilities.ts, and for the same reason: this file has NO imports, so
// `node --test` loads it directly and tests/student-nav-items.test.ts can fault
// the rule. It was extracted out of StudentNav.tsx, which is a 'use client'
// component importing next/navigation and half a dozen theme modules and is
// therefore unloadable outside a bundler -- so while the list lived there, the
// rule that hides two destinations from a student could only ever be
// eyeballed.
//
// StudentNav.tsx re-exports both symbols, so nothing else moved.

export type NavItem = {
  label: string;
  href: string;
  /**
   * Only shown to a viewer who is linked to a class.
   *
   * A FLAG ON THE DATA, NOT A LABEL MATCH AT THE FILTER. The alternative was
   * `NAV_ITEMS.filter((i) => i.label !== 'Announcements' && ...)`, which reads
   * fine and breaks silently: renaming a label, or adding a third teacher-fed
   * destination, leaves the filter compiling and wrong. The rule travels with
   * the row it applies to, so a new item declares its own answer.
   *
   * WHAT MAKES AN ITEM class-scoped: everything behind it is pushed by a
   * teacher, so with no teacher there is structurally nothing to show. That is
   * a property of the DESTINATION, not of the viewer, which is why it lives
   * here rather than in the branch that renders it.
   */
  classOnly?: boolean;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  // classOnly: every post reaching a student is either addressed to one of
  // their classes or is a school-wide notice. See navItemsFor.
  { label: 'Announcements', href: '/dashboard/announcements', classOnly: true },
  // Between the teacher's voice and the self-directed tree, because that is
  // what it is: work somebody else set, which Modules onward is not.
  //
  // classOnly, and this one is absolute: getStudentAssignments returns [] the
  // moment the student's active-class set is empty (dashboard/data.ts), so for
  // a solo student this page cannot show anything, ever.
  { label: 'Assignments', href: '/dashboard/assignments', classOnly: true },
  { label: 'Modules', href: '/dashboard/modules' },
  { label: 'Grades', href: '/dashboard/grades' },
  // The only destination here that leaves the /dashboard tree. It is in this
  // list rather than beside it because from a student's side of the screen it
  // is simply another place to go, and splitting it out would say otherwise.
  { label: 'Take a Practice Test', href: '/adaptive-test' },
];

/**
 * The destinations this viewer is offered.
 *
 * `hasClass` DEFAULTS TO TRUE, AND THE DEFAULT IS THE SAFE DIRECTION. Three
 * places mount this nav and only one of them knows the answer: the dashboard
 * shell, which resolves it from showsClassChrome. The curriculum tree's
 * slide-over and the DB-free verification lane pass nothing, and both keep the
 * full list they have always rendered. So a caller that has not been taught the
 * question shows MORE rather than hiding a destination it had no opinion about.
 *
 * Hiding is presentation and nothing else. Every route in this list still
 * exists, still authorises the same way, and still renders for a solo student
 * who reaches it by URL -- see the empty states on /dashboard/announcements and
 * /dashboard/assignments. Nothing here is a permission check and nothing may
 * come to depend on it as one.
 */
export function navItemsFor(hasClass: boolean): readonly NavItem[] {
  return hasClass ? NAV_ITEMS : NAV_ITEMS.filter((item) => !item.classOnly);
}
