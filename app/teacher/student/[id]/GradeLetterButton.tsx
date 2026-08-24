'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DASH } from '../../../components/dashboard-theme';
import { FONT_BODY } from '../../../components/fonts';
import { LetterChip, type SerializedLetter } from '../../students/grade-ui';

// The grade letter in the student-detail banner. THE FOURTH ENTRY POINT.
//
// Routes to /teacher/students/grades/[studentId] -- the same page the class grid
// cell and the roster row open. Not a fourth gradebook, not a summary that has
// to be kept in step: one route, and the letter shown here is the same
// rollupLetter value the roster column shows, read off the same endpoint.
//
// IT ALWAYS ROUTES, INCLUDING WITH NO GRADED WORK. Settled by Juan, 2026-08-24,
// and it is the right call for a reason worth writing down: a disabled control
// tells a teacher "this is broken or you may not", when what is true is "there
// is nothing graded yet" -- and the only way to learn which is to land on the
// gradebook and read it. So the empty state is a live link to a page that says
// so plainly.
//
// It is also the simpler build, not the harder one. Disabling would need a
// second style path, aria-disabled, and a tooltip explaining itself; routing
// needs none of those, because the destination already explains itself.
//
// ITS OWN FETCH, resolving independently of the profile. page.tsx blocks its
// entire render on /api/teacher/student, and a second await in that chain would
// hold the whole banner -- name, placement, score -- behind the grade. Same
// split, same reason, as OfficialScorePanel and CurriculumProgressPanel on this
// page.

export default function GradeLetterButton({
  studentId,
  classId,
  isMobile,
}: {
  studentId: string;
  classId: string;
  isMobile: boolean;
}) {
  const [letter, setLetter] = useState<SerializedLetter | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!classId || !studentId) return;
      const res = await fetch(`/api/teacher/grades?class_id=${classId}&student_id=${studentId}`);
      if (!live) return;
      if (!res.ok) {
        setFailed(true);
        return;
      }
      const body = await res.json();
      setLetter(body.letter ?? null);
    })();
    return () => {
      live = false;
    };
  }, [studentId, classId]);

  // A failed grade read renders NOTHING rather than a broken-looking control.
  // The rest of the banner is unaffected and still worth reading, which is the
  // whole point of this being a separate fetch.
  if (failed) return null;

  const href = `/teacher/students/grades/${studentId}?class_id=${classId}`;

  return (
    <Link
      href={href}
      aria-label="Open this student's gradebook"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: isMobile ? '10px 12px' : '10px 14px',
        border: `1px solid ${DASH.line}`,
        borderRadius: 12,
        background: DASH.cardBg,
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {letter === null ? (
        // Pre-arrival. A neutral placeholder in the final geometry, so the
        // banner does not jump when the value lands.
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 46,
            height: 46,
            borderRadius: 9,
            background: DASH.chipBg,
            color: DASH.dim,
            font: `700 24px ${FONT_BODY}`,
            lineHeight: 1,
          }}
        >
          ·
        </span>
      ) : (
        <LetterChip letter={letter} size="lg" showSubtitle={false} />
      )}

      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ font: `700 12px ${FONT_BODY}`, color: DASH.heading, whiteSpace: 'nowrap' }}>
          Gradebook →
        </span>
        <span style={{ font: `400 11px ${FONT_BODY}`, color: DASH.dim, whiteSpace: 'nowrap' }}>
          {letter === null
            ? 'Loading grade'
            : letter.kind === 'letter'
              ? `${letter.percent}% overall`
              : letter.subtitle}
        </span>
      </span>
    </Link>
  );
}
