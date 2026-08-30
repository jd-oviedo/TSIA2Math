import Link from 'next/link';
import { FONT_BODY } from '../../../../components/fonts';
import { requireGradesTeacher, resolveClass } from '../../students-data';
import { NoClass, StudentsShell } from '../../shell';
import GradebookClient from './GradebookClient';
import TeacherShell from '../../../TeacherShell';
import { loadTeacherIdentity } from '../../../teacher-identity';

// /teacher/students/grades/[studentId] -- one student's gradebook.
//
// THE ONE PAGE ALL FOUR ENTRY POINTS RESOLVE TO:
//
//   the class grid cell          /teacher/students/grades
//   the roster row               /teacher/students
//   the student-detail banner    /teacher/student/[id]
//   a direct link
//
// Not three implementations that agree; one route, rendered once, reading one
// /api/teacher/grades response.
//
// THE STUDENT'S NAME IS NOT IN THE PAGE PARAMS AND IS NOT LOOKED UP HERE. It
// arrives in the response body, after the route has checked that this teacher
// owns the class AND that the student is an active member of it. Resolving a
// name server-side before that check would turn this URL into a directory
// lookup: any student id, plus a class the caller happens to own, would confirm
// a real person's name in the page title. The heading says "Gradebook" until the
// data that is allowed to name them arrives.

export const dynamic = 'force-dynamic';

export default async function StudentGradebookPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ class_id?: string }>;
}) {
  const profile = await requireGradesTeacher('/teacher/students');
  // See the note in ../../page.tsx: the rail needs a name, an email and the
  // founder flag, and a Profile carries none of the three.
  const identity = await loadTeacherIdentity();
  const { studentId } = await params;
  const { class_id } = await searchParams;
  const { classes, selected } = await resolveClass(profile.id, class_id);

  return (
    <TeacherShell
      variant="standalone"
      activeLabel="Students"
      teacherName={identity.teacherName}
      teacherEmail={identity.teacherEmail}
      isFounder={identity.isFounder}
      plan={profile.plan}
    >
    <StudentsShell
      classes={classes}
      selected={selected}
      // Switching class from HERE would carry this student id into a class they
      // are not in, which the route correctly 404s. So the chips point back at
      // the roster for the chosen class instead of at this page.
      basePath="/teacher/students"
      title="Gradebook"
      blurb="Every topic this student has been set or has worked on, with both readings of their quiz score."
      actions={
        selected && (
          // The dashboard's roster link treatment, reached through
          // --umt-view-ink: DASH.link #2F6091, hovering to DASH.linkHover
          // #0F69BA, arrow nudging 2px. Retires #C68A2F as an ink.
          <Link
            href={`/teacher/student/${studentId}?class_id=${selected.id}`}
            className="um-tdash-view"
            style={{ font: `700 13px ${FONT_BODY}`, textDecoration: 'none' }}
          >
            Full profile <span aria-hidden="true">&rarr;</span>
          </Link>
        )
      }
    >
      {selected ? <GradebookClient studentId={studentId} classId={selected.id} /> : <NoClass />}
    </StudentsShell>
    </TeacherShell>
  );
}
