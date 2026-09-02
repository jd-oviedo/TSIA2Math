import { getProfile } from '../../lib/auth';
import { getStudentAssignments, showsClassChrome } from '../data';
import { EmptyState, PageHeading } from '../ui';
import AssignmentsList from './AssignmentsList';

// Assignments. Whole topics a teacher has set for this student, grouped by when
// they are due.
//
// The server half is deliberately thin: read, then hand off. Everything that
// needs a clock -- the four buckets, the overdue chip -- happens in the client
// component, for the reason set out in its header. Nothing here decides what is
// overdue and nothing here sorts.
//
// Teachers set these from /teacher, which posts to /api/teacher/assignments.
// Nothing on this page writes.
//
// THIS ROUTE STAYS OPEN TO A SOLO STUDENT, whose nav no longer offers it --
// same choice as /dashboard/announcements and for the same reasons, set out at
// the top of that file. Deep links, bookmarks, an anonymous visitor who signs
// in mid-session and anything else that reaches this URL still land on a page
// that works and says why it is empty, instead of a redirect.
//
// The nav is hidden in BOTH mounts now -- the dashboard rail and the curriculum
// tree's slide-over -- so nothing in the product links here for a solo student.
// That makes this page's own empty state the only thing standing between them
// and a blank screen, which is the argument for it rather than against it: the
// fewer routes in that make it MORE important that this one explains itself.
//
// Unlike announcements this page IS always empty for a solo student:
// getStudentAssignments returns [] as soon as the active-class set is empty. So
// the empty state below is the whole page for them, which is exactly why it has
// to explain itself rather than imply work is on its way.

export default async function AssignmentsPage() {
  const profile = await getProfile();
  if (!profile) return null; // The layout has already redirected.

  // Scoped to the caller's own id, read through the admin client, exactly as
  // every other student surface in this tree is. See the note in ../data.ts:
  // the RLS policies on these tables are the second line, not this read path.
  const [assignments, hasClass] = await Promise.all([
    getStudentAssignments(profile.id),
    showsClassChrome(profile),
  ]);

  return (
    <>
      <PageHeading
        title="Assignments"
        blurb="Topics your teacher has set, and how far you have got with each."
      />

      {assignments.length === 0 ? (
        // The ordinary first-run state for most students, and it is not a
        // failure. Said plainly rather than dressed up -- the same call
        // EmptyState's own comment makes.
        //
        // SPLIT BY WHETHER THERE IS A TEACHER AT ALL. "When your teacher sets a
        // topic" is a promise to a student who has no teacher, and this is the
        // only page they would ever see it on.
        hasClass ? (
          <EmptyState
            title="Nothing assigned right now"
            detail="When your teacher sets a topic, it will show up here with its due date."
          />
        ) : (
          <EmptyState
            title="You're not in a class yet"
            detail="Assignments are topics a teacher sets for your class. If you're given a class code, you can join from the link on your Home page — until then, Modules is where to pick your own way through the course."
          />
        )
      ) : (
        // NO CLOCK IS PASSED, and none may be read here. Bucketing is
        // time-relative and this is a render path; see AssignmentsList's header
        // for the lint rule that proves the point rather than asserts it.
        <AssignmentsList assignments={assignments} />
      )}
    </>
  );
}
