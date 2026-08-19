import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { parseCoursePath } from '../lib/course-path';
import { allowsTopic } from '../lib/capabilities';
import { resolveCourseAccess } from '../lib/course-access';
import { loginHref, safeNext, DEFAULT_NEXT } from '../lib/next-param';

// THE GATE FOR THE WHOLE /course TREE.
//
// This was a twelve line passthrough div with no imports, and the tree behind it
// has never had an auth check of any kind: every topic was readable by an
// anonymous visitor, which meant the $89 Full Course unlocked nothing, because
// the curriculum it would unlock was already free and complete.
//
// WHY HERE AND NOT IN THE FOUR PAGES
//
// This is the one place all four routes must pass through, so a fifth sub-route
// cannot be added without a gate. That is the same reasoning middleware.ts
// already gives for keeping the dashboard gate in a layout rather than
// scattering it across the pages that know their own paths.
//
// It works because a server component is only a description until React renders
// it. The topic layout already documents this for the placeholder case: not
// rendering {children} means the page component is never invoked, so the loads
// below it never run. redirect() throws, so nothing under here renders either,
// and loadTopic never executes.
//
// ORDERED BEFORE loadTopic ON PURPOSE. loadTopic calls notFound() for an unknown
// topic. Gating after it would let an unentitled visitor tell a 404 from a gate
// response and enumerate every valid topic id. Gating first, they cannot.

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  // A layout is given no part of the URL, so the path arrives as the x-pathname
  // header middleware stamps. Kept raw as well as parsed: the sign-in redirect
  // has to send the visitor back to the page they actually asked for, and
  // rebuilding that from the parsed courseId would lose the unit segment and
  // would break on any course id containing more than one hyphen.
  const requested = (await headers()).get('x-pathname');
  const parsed = parseCoursePath(requested);

  if (parsed.kind === 'unreadable') {
    // FAILS CLOSED, AND REPORTS.
    //
    // Denying alone is not enough. A header-read failure is a real defect, and
    // if it only ever manifests as a locked out customer it reaches us as a
    // support ticket with no diagnostic attached. Reporting means the failure
    // surfaces as the bug it is rather than as free access or as a mystery.
    //
    // The mirror failure is the one that matters more: falling back to "allow"
    // here would mean a middleware that stopped stamping the header silently
    // opened the entire tree, with nothing anywhere to say so.
    Sentry.captureException(new Error('course gate: unreadable x-pathname'), {
      level: 'warning',
      tags: { gate: 'course' },
    });
    redirect('/dashboard');
  }

  const access = await resolveCourseAccess();

  if (!allowsTopic(access, 'curriculum', parsed.courseId, parsed.topicId)) {
    // Signed out goes to sign-in and comes back here. Signed in without
    // entitlement has nothing to sign in as, so it goes to the holding page.
    redirect(
      access.signedIn
        ? '/dashboard/upgrade'
        : loginHref(safeNext(requested, DEFAULT_NEXT))
    );
  }

  return <div>{children}</div>;
}

// Explicit rather than inferred. Reading cookies would make this dynamic in
// practice, but the failure being avoided is a cached gated page served to
// someone who should not have it, so it is declared.
export const dynamic = 'force-dynamic';
