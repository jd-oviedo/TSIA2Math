import Link from 'next/link';
import { DASH } from '../../components/dashboard-theme';
import { FONT_BODY } from '../../components/fonts';
import { requireGradesTeacher, resolveClass } from './students-data';
import { NoClass, StudentsShell } from './shell';
import StudentsClient from './StudentsClient';

// /teacher/students -- the full roster, with a grade column.
//
// A NEW PAGE. THE DASHBOARD ROSTER DOES NOT MOVE, and that is a decision rather
// than an omission. The "Students" nav item used to point at /teacher#roster, an
// anchor into TeacherDashboardClient's own roster section, and that section:
//
//   * carries data-tour="roster", which is step 6 of TeacherTour. Moving it
//     breaks the onboarding tour for every new teacher.
//   * is the busiest surface in the product. Relocating it is a live behaviour
//     change with no user asking for it.
//
// So the anchor and the tour stay exactly as they are, and this page is the
// fuller view the nav item now leads to instead. The two show the same roster
// from the same /api/teacher/roster; only this one carries grades.

export const dynamic = 'force-dynamic';

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string }>;
}) {
  const profile = await requireGradesTeacher('/teacher/students');
  const { class_id } = await searchParams;
  const { classes, selected } = await resolveClass(profile.id, class_id);

  return (
    <StudentsShell
      classes={classes}
      selected={selected}
      basePath="/teacher/students"
      crumbs={[{ label: 'Dashboard', href: '/teacher' }, { label: selected?.name ?? 'Students' }]}
      title="Students"
      blurb="Everyone in this class, and how they are scoring. A grade is the average of a student's quiz scores across the topics they have been quizzed on — practice is never part of it."
      actions={
        selected && (
          // THE SECOND ENTRY POINT to the gradebook arc: the grid, which then
          // drills into the same per-student page the rows below link to.
          <Link
            href={`/teacher/students/grades?class_id=${selected.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              font: `700 13px ${FONT_BODY}`,
              padding: '9px 15px',
              borderRadius: 8,
              border: '1px solid #C68A2F',
              background: '#FBF4E6',
              color: '#9A6A1F',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <rect x="2.2" y="2.2" width="13.6" height="13.6" rx="1.6" />
              <line x1="2.2" y1="6.8" x2="15.8" y2="6.8" />
              <line x1="6.8" y1="6.8" x2="6.8" y2="15.8" />
            </svg>
            Grades
          </Link>
        )
      }
    >
      {selected ? (
        <StudentsClient classId={selected.id} />
      ) : classes.length === 0 ? (
        <div
          style={{
            background: DASH.cardBg,
            border: `1px solid ${DASH.cardBorder}`,
            borderRadius: 12,
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 6px', font: `400 14px ${FONT_BODY}`, color: DASH.muted }}>
            You have no classes yet.
          </p>
          <Link href="/teacher" style={{ font: `700 13px ${FONT_BODY}`, color: '#C68A2F', textDecoration: 'none' }}>
            Create one on the dashboard →
          </Link>
        </div>
      ) : (
        <NoClass />
      )}
    </StudentsShell>
  );
}
