'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DASH } from '../../../components/dashboard-theme';
import { FONT_BODY, FONT_HEADING } from '../../../components/fonts';
import { CompletionPill, LetterChip, ScorePair, type Score, type SerializedLetter } from '../grade-ui';

// The class grid: students down, topics across, quiz scores in the cells.
//
// COLUMNS ARE THE TOPICS THIS CLASS HAS BEEN SET OR HAS TOUCHED, not all 97.
// The route decides that; this component would render whatever it is given, and
// a 97-column grid of which four are populated is a report on what has not been
// taught yet rather than on the class.
//
// EVERY CELL CARRIES BOTH DEFINITIONS. Mastery is what the letter commits to;
// latest is what the student is looking at on their own Grades page. They
// disagree -- 1/3 against 2/4 for the student this was built against -- and a
// grid that showed one number would make a teacher confidently wrong in a
// conversation with either the student or the syllabus.
//
// PRACTICE IS IN THE CELL AND IS NOT IN THE GRADE. It rides along as context so
// a teacher can see effort beside attainment. Nothing here sums the two, and the
// completion pill is the only place practice counts toward anything.

type Cell = {
  course_id: string;
  topic_id: string;
  quiz_latest: Score;
  quiz_mastery: Score;
  practice_latest: Score;
  practice_mastery: Score;
  completion: { done: number; total: number } | null;
};

type Student = {
  student_id: string;
  name: string;
  initials: string;
  letter: SerializedLetter;
  cells: Cell[];
};

type TopicColumn = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
};

type Body = { class_id: string; topics: TopicColumn[]; students: Student[] };

export default function GradesGridClient({ classId }: { classId: string }) {
  const [body, setBody] = useState<Body | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    setBody(null);
    const res = await fetch(`/api/teacher/grades?class_id=${classId}`);
    if (!res.ok) {
      setFailed(true);
      return;
    }
    setBody(await res.json());
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  if (failed) {
    return (
      <div style={card()}>
        <p style={{ margin: 0, font: `400 14px ${FONT_BODY}`, color: '#9A2A2A' }}>Could not load grades for this class.</p>
      </div>
    );
  }

  if (!body) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div
          style={{
            width: 30,
            height: 30,
            border: `3px solid ${DASH.line}`,
            borderTopColor: '#C68A2F',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'umspin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (body.students.length === 0) {
    return (
      <div style={{ ...card(), textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ margin: 0, font: `400 14px ${FONT_BODY}`, color: DASH.muted }}>No students enrolled yet.</p>
      </div>
    );
  }

  if (body.topics.length === 0) {
    // NOT AN ERROR, AND SAID SO. Nothing has been assigned and nobody has
    // started, which is the ordinary state of a new class and must not read as
    // a failure to load.
    return (
      <div style={{ ...card(), textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ margin: '0 0 6px', font: `400 14px ${FONT_BODY}`, color: DASH.muted }}>
          No topics to grade yet.
        </p>
        <p style={{ margin: 0, font: `400 13px ${FONT_BODY}`, color: DASH.dim }}>
          A topic appears here once it has been assigned to somebody, or once a student has worked on it.
        </p>
      </div>
    );
  }

  const gradebookHref = (id: string) => `/teacher/students/grades/${id}?class_id=${classId}`;

  return (
    <div style={{ ...card(), padding: 0, overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 720 }}>
        <caption className="um-visually-hidden">
          Quiz scores for every student against every topic this class has been set or has worked on. Each
          cell shows the mastery score (ever correct, over the whole quiz) and the latest-attempt score (over
          the questions answered).
        </caption>
        <thead>
          <tr style={{ background: DASH.subtleBg, borderBottom: `1px solid ${DASH.line}` }}>
            <th
              scope="col"
              style={{
                ...headCell(),
                position: 'sticky',
                left: 0,
                zIndex: 2,
                background: DASH.subtleBg,
                minWidth: 210,
                textAlign: 'left',
              }}
            >
              Student
            </th>
            {body.topics.map((t) => (
              <th key={`${t.course_id}:${t.topic_id}`} scope="col" style={{ ...headCell(), minWidth: 150 }}>
                <div style={{ font: `700 11px ${FONT_BODY}`, color: DASH.dim, letterSpacing: 0.4 }}>{t.topic_id}</div>
                <div
                  title={t.topic_name}
                  style={{
                    marginTop: 3,
                    font: `400 11px ${FONT_BODY}`,
                    color: DASH.dim,
                    textTransform: 'none',
                    letterSpacing: 0,
                    maxWidth: 170,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.topic_name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.students.map((s, i) => (
            <tr key={s.student_id} style={{ borderBottom: i < body.students.length - 1 ? `1px solid ${DASH.hairline}` : 'none' }}>
              <th
                scope="row"
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  background: DASH.cardBg,
                  borderRight: `1px solid ${DASH.hairline}`,
                  fontWeight: 400,
                }}
              >
                {/* THE GRID ENTRY POINT: selecting a student opens the same
                    per-student gradebook the roster row and the detail-page
                    banner button open. */}
                <Link
                  href={gradebookHref(s.student_id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                >
                  <LetterChip letter={s.letter} size="sm" showSubtitle={false} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', font: `600 13px ${FONT_BODY}`, color: DASH.ink }}>{s.name}</span>
                    <span style={{ display: 'block', font: `400 11px ${FONT_BODY}`, color: DASH.dim }}>
                      {s.letter.kind === 'withheld' ? s.letter.subtitle : `${s.letter.percent}% overall`}
                    </span>
                  </span>
                </Link>
              </th>

              {s.cells.map((c) => (
                <td
                  key={`${c.course_id}:${c.topic_id}`}
                  style={{ padding: '12px 14px', verticalAlign: 'top', borderLeft: `1px solid ${DASH.hairline}` }}
                >
                  <ScorePair latest={c.quiz_latest} mastery={c.quiz_mastery} compact />
                  <div style={{ marginTop: 7 }}>
                    <CompletionPill completion={c.completion} />
                  </div>
                  <div style={{ marginTop: 4, font: `400 11px ${FONT_BODY}`, color: DASH.dim, whiteSpace: 'nowrap' }}>
                    {practiceLabel(c)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${DASH.hairline}`, background: DASH.subtleBg }}>
        <p style={{ margin: 0, font: `400 11.5px ${FONT_BODY}`, color: DASH.dim, maxWidth: 780 }}>
          <strong style={{ color: DASH.muted, font: `700 11.5px ${FONT_HEADING}` }}>Mastery</strong> counts every question
          a student has ever answered correctly, over the whole quiz — the same rule the completion gates use, so it never
          drops when a student retries. <strong style={{ color: DASH.muted, font: `700 11.5px ${FONT_HEADING}` }}>Latest</strong> counts
          only their most recent answer to each question, over the questions they have answered — the number the student
          sees on their own Grades page. The two can disagree; both are shown so neither surprises you.
          Practice is listed for context and is never part of a grade.
        </p>
      </div>
    </div>
  );
}

function practiceLabel(c: Cell): string {
  const s = c.practice_mastery ?? c.practice_latest;
  return s ? `${s.correct}/${s.total} practice` : 'no practice';
}

function headCell(): React.CSSProperties {
  return {
    padding: '10px 14px',
    font: `700 11px ${FONT_BODY}`,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: DASH.dim,
    textAlign: 'left',
    verticalAlign: 'bottom',
    whiteSpace: 'nowrap',
  };
}

function card(): React.CSSProperties {
  return {
    background: DASH.cardBg,
    border: `1px solid ${DASH.cardBorder}`,
    borderRadius: 12,
    padding: '16px 18px',
    boxShadow: DASH.cardShadow,
  };
}
