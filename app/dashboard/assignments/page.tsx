import { getProfile } from '../../lib/auth';
import { getStudentAssignments } from '../data';
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

export default async function AssignmentsPage() {
  const profile = await getProfile();
  if (!profile) return null; // The layout has already redirected.

  // Scoped to the caller's own id, read through the admin client, exactly as
  // every other student surface in this tree is. See the note in ../data.ts:
  // the RLS policies on these tables are the second line, not this read path.
  const assignments = await getStudentAssignments(profile.id);

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
        <EmptyState
          title="Nothing assigned right now"
          detail="When your teacher sets a topic, it will show up here with its due date."
        />
      ) : (
        // NO CLOCK IS PASSED, and none may be read here. Bucketing is
        // time-relative and this is a render path; see AssignmentsList's header
        // for the lint rule that proves the point rather than asserts it.
        <AssignmentsList assignments={assignments} />
      )}
    </>
  );
}
