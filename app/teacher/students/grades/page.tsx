import { requireGradesTeacher, resolveClass } from '../students-data';
import { NoClass, StudentsShell } from '../shell';
import GradesGridClient from './GradesGridClient';
import TeacherShell from '../../TeacherShell';
import { loadTeacherIdentity } from '../../teacher-identity';

// /teacher/students/grades -- the class grid.
//
// Reached from the "Grades" button on /teacher/students, and drills into
// /teacher/students/grades/[studentId], which is the SAME page the roster rows
// and the student-detail banner button open. Three ways in, one gradebook.

export const dynamic = 'force-dynamic';

export default async function ClassGradesPage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string }>;
}) {
  const profile = await requireGradesTeacher('/teacher/students/grades');
  // See the note in ../page.tsx: the rail needs a name, an email and the
  // founder flag, and a Profile carries none of the three.
  const identity = await loadTeacherIdentity();
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
      basePath="/teacher/students/grades"
      title="Class grades"
      blurb="Quiz scores for every student against every topic this class has been set or has worked on. Select a student to open their gradebook."
    >
      {selected ? <GradesGridClient classId={selected.id} /> : <NoClass />}
    </StudentsShell>
    </TeacherShell>
  );
}
