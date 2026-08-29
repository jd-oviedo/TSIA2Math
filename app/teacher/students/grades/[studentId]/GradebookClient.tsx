'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DASH } from '../../../../components/dashboard-theme';
import { FONT_BODY, FONT_HEADING } from '../../../../components/fonts';
import { unitLabel } from '../../../../lib/units';
import { CompletionPill, LetterChip, PracticeContext, ScorePair, type Score, type SerializedLetter } from '../../grade-ui';

// One student's gradebook. THE PAGE ALL FOUR ENTRY POINTS RESOLVE TO:
//
//   the class grid cell            /teacher/students/grades
//   the roster row                 /teacher/students
//   the student-detail banner      /teacher/student/[id]
//   (and a direct link)
//
// One route, one component, one rollupLetter call. The letter at the top of this
// page is the same value as the letter in the roster column and the one on the
// banner button, because all three read it off the same /api/teacher/grades
// response shape rather than each deriving it.
//
// GROUPED BY UNIT, IN COURSE ORDER, because a gradebook is read against the
// syllabus rather than against the order a student happened to work.

type Row = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
  quiz_latest: Score;
  quiz_mastery: Score;
  practice_latest: Score;
  practice_mastery: Score;
  completion: { done: number; total: number } | null;
};

type Body = {
  student_id: string;
  class_id: string;
  name: string;
  initials: string;
  letter: SerializedLetter;
  topics: Row[];
};

export default function GradebookClient({ studentId, classId }: { studentId: string; classId: string }) {
  const [body, setBody] = useState<Body | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setBody(null);
    const res = await fetch(`/api/teacher/grades?class_id=${classId}&student_id=${studentId}`);
    if (!res.ok) {
      setError(res.status === 404 ? 'That student is not in this class.' : 'Could not load this gradebook.');
      return;
    }
    setBody(await res.json());
  }, [classId, studentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div style={card()}>
        <p style={{ margin: '0 0 10px', font: `400 14px ${FONT_BODY}`, color: '#9A2A2A' }}>{error}</p>
        <Link href={`/teacher/students?class_id=${classId}`} style={{ font: `700 13px ${FONT_BODY}`, color: '#C68A2F', textDecoration: 'none' }}>
          ← Back to students
        </Link>
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
            animation: 'um-spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  const graded = body.topics.filter((t) => t.quiz_mastery !== null);
  const units = [...new Set(body.topics.map((t) => t.unit_number))].sort((a, b) => a - b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* The headline. Same letter, same computation, as the roster column. */}
      <div style={{ ...card(), display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <LetterChip letter={body.letter} size="lg" showSubtitle={false} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ font: `600 15px ${FONT_HEADING}`, color: DASH.heading }}>
            {body.letter.kind === 'letter' ? `${body.letter.percent}% overall` : 'No overall grade yet'}
          </div>
          <div style={{ marginTop: 4, font: `400 12.5px ${FONT_BODY}`, color: DASH.muted, maxWidth: 620 }}>
            {body.letter.kind === 'letter' ? (
              <>
                The average of {body.letter.graded_topics} quiz {body.letter.graded_topics === 1 ? 'score' : 'scores'}, each
                topic counting the same. Topics {body.name || 'this student'} has not been quizzed on are not part of it.
              </>
            ) : (
              <>
                {body.letter.subtitle}
                {body.letter.reason !== 'no_graded_work' && '. '}
                {body.letter.reason === 'no_graded_work'
                  ? '. A grade appears once there is enough quizzed work to average.'
                  : 'A grade is held back until there is enough quizzed work for it to mean something, rather than shown as a low mark based on very little.'}
              </>
            )}
          </div>
        </div>
      </div>

      {body.topics.length === 0 ? (
        <div style={{ ...card(), textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ margin: '0 0 6px', font: `400 14px ${FONT_BODY}`, color: DASH.muted }}>
            Nothing assigned or started yet.
          </p>
          <p style={{ margin: 0, font: `400 13px ${FONT_BODY}`, color: DASH.dim }}>
            Topics appear here once you set work, or once {body.name || 'this student'} opens one.
          </p>
        </div>
      ) : (
        units.map((unit) => {
          const rows = body.topics.filter((t) => t.unit_number === unit);
          return (
            <section key={unit}>
              <h2 style={{ margin: '0 0 10px', font: `600 15px ${FONT_HEADING}`, color: DASH.heading }}>
                {unitLabel(unit)}
              </h2>
              <div style={{ ...card(), padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                  <caption className="um-visually-hidden">
                    Quiz grade, completion and practice for each topic in {unitLabel(unit)}
                  </caption>
                  <thead>
                    <tr style={{ background: DASH.subtleBg, borderBottom: `1px solid ${DASH.line}` }}>
                      {['Topic', 'Quiz grade', 'Completion', 'Practice'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          style={{
                            padding: '10px 16px',
                            textAlign: 'left',
                            font: `700 11px ${FONT_BODY}`,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                            color: DASH.dim,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t, i) => (
                      <tr
                        key={`${t.course_id}:${t.topic_id}`}
                        style={{ borderBottom: i < rows.length - 1 ? `1px solid ${DASH.hairline}` : 'none' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ font: `600 13.5px ${FONT_BODY}`, color: DASH.ink }}>{t.topic_name}</div>
                          <div style={{ font: `400 11.5px ${FONT_BODY}`, color: DASH.dim }}>{t.topic_id}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <ScorePair latest={t.quiz_latest} mastery={t.quiz_mastery} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <CompletionPill completion={t.completion} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <PracticeContext latest={t.practice_latest} mastery={t.practice_mastery} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}

      <div style={{ ...card(), background: DASH.subtleBg }}>
        <p style={{ margin: 0, font: `400 12px ${FONT_BODY}`, color: DASH.dim, maxWidth: 820 }}>
          <strong style={{ color: DASH.muted }}>How these numbers work.</strong>{' '}
          <em>Mastery</em> counts every question ever answered correctly, over the whole quiz — the rule the completion
          gates use, so it never drops when a student retries. <em>Latest</em> counts only the most recent answer to each
          question, over the questions answered — the number the student sees on their own Grades page. They can disagree.
          <br />
          <em>Completion</em> is out of three: lesson, practice, quiz. Practice counts toward completion and is never part
          of a grade — so a topic can show 2/3 done and contribute nothing to the average above, because the quiz has not
          been taken. {graded.length} of {body.topics.length} {body.topics.length === 1 ? 'topic has' : 'topics have'} a quiz
          score.
        </p>
      </div>
    </div>
  );
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
