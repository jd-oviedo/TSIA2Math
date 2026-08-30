import Link from 'next/link';
import { DASH, flatPanelStyle } from '../../components/dashboard-theme';
import { NAVY, INK_2 } from '../dashboard-chrome';
import { FONT_BODY } from '../../components/fonts';
import { requireGradesTeacher, resolveClass } from './students-data';
import { NoClass, StudentsShell } from './shell';
import StudentsClient from './StudentsClient';
import TeacherShell from '../TeacherShell';
import { loadTeacherIdentity } from '../teacher-identity';

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
  // Name, email and founder flag for the rail. requireGradesTeacher returns a
  // Profile, which carries `plan` but no name and no founder flag -- profiles
  // has no name column at all -- so any page that mounts the rail has to read
  // them separately. Read AFTER the gate, never before.
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
      basePath="/teacher/students"
      title="Students"
      blurb="Everyone in this class, and how they are scoring. A grade is the average of a student's quiz scores across the topics they have been quizzed on, and practice is never part of it."
      actions={
        selected && (
          // THE SECOND ENTRY POINT to the gradebook arc: the grid, which then
          // drills into the same per-student page the rows below link to.
          // DASHBOARD NAVY OUTLINE, the secondary treatment Invite and
          // Collapse carry on the dashboard. NOT orange: the dashboard spends
          // its one Sunset Orange fill on the single primary action per screen
          // (New class), and moving between two views of the same roster is not
          // that. Retires #C68A2F on #FBF4E6 with #9A6A1F ink, which was three
          // amber values doing one button.
          <Link
            href={`/teacher/students/grades?class_id=${selected.id}`}
            className="um-tdash-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              font: `700 13px ${FONT_BODY}`,
              padding: '9px 15px',
              borderRadius: 0,
              border: `1px solid ${NAVY}`,
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
        <div style={{ ...flatPanelStyle(), padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', font: `400 14px ${FONT_BODY}`, color: INK_2 }}>
            You have no classes yet.
          </p>
          {/* The dashboard's roster link treatment: DASH.link #2F6091 through
              --umt-view-ink, hovering to DASH.linkHover #0F69BA, with the arrow
              nudging 2px. Retires #C68A2F as an ink. */}
          <Link href="/teacher" className="um-tdash-view" style={{ font: `700 13px ${FONT_BODY}`, textDecoration: 'none' }}>
            Create one on the dashboard <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : (
        <NoClass />
      )}
    </StudentsShell>
    </TeacherShell>
  );
}
