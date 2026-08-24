import { requireGradesTeacher, resolveClass } from '../students-data';
import { NoClass, StudentsShell } from '../shell';
import GradesGridClient from './GradesGridClient';

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
  const { class_id } = await searchParams;
  const { classes, selected } = await resolveClass(profile.id, class_id);

  return (
    <StudentsShell
      classes={classes}
      selected={selected}
      basePath="/teacher/students/grades"
      crumbs={[
        { label: 'Dashboard', href: '/teacher' },
        {
          label: 'Students',
          href: selected ? `/teacher/students?class_id=${selected.id}` : '/teacher/students',
        },
        { label: 'Grades' },
      ]}
      title="Class grades"
      blurb="Quiz scores for every student against every topic this class has been set or has worked on. Select a student to open their gradebook."
    >
      {selected ? <GradesGridClient classId={selected.id} /> : <NoClass />}
    </StudentsShell>
  );
}
