import { getProfile } from '../../lib/auth';
import { latestAttemptScores } from '../../lib/grades';
import { getTopics, getAttempts, getTestSessions } from '../data';
import { Card, CardTitle, EmptyState, Muted, PageHeading, formatDate } from '../ui';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';

// Grades. The student's own view of their own results, so raw scores are shown
// here. The no-raw-scores rule belongs to the parent-facing digest, not this
// page.
//
// Two sources, deliberately kept as two tables rather than blended into one
// number: adaptive test sessions, and per-topic curriculum work. They measure
// different things and averaging them would mean nothing.

const SECTION_LABELS: Record<string, string> = {
  practice: 'Practice',
  mini_quiz: 'Mini quiz',
};

export default async function GradesPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [sessions, attempts, { topics }] = await Promise.all([
    getTestSessions(profile.id),
    getAttempts(profile.id),
    getTopics(),
  ]);

  const topicNames = new Map(topics.map((t) => [`${t.course_id}:${t.topic_id}`, t.topic_name]));

  // Latest attempt per item, so a retry replaces the earlier answer rather than
  // counting twice.
  //
  // THE REDUCER MOVED TO app/lib/grades.ts AND THIS PAGE NOW CALLS IT. Build 3.
  // It was twenty-six lines inline here, and it was the ONLY definition of the
  // number a student reads as their score -- so a teacher surface needing the
  // same number had exactly two options, and copying it was the one that would
  // have gone unnoticed until the two drifted.
  //
  // NOTHING ABOUT THE ARITHMETIC CHANGED, and that is proved rather than
  // asserted: scripts/faultproof_grades_extract.mjs holds this loop frozen
  // verbatim as its oracle and runs eleven fixtures -- including this student's
  // real GR.4.3 rows -- through both, with five mis-extractions that must each
  // redden exactly the cases named against them.
  //
  // ONE THING IS STRICTER THERE THAN IT WAS HERE. This loop's `!latest.has(key)`
  // was correct only because getAttempts happens to order created_at descending;
  // nothing said so, and a caller passing rows any other way got the OLDEST
  // attempt per item, silently. The extracted form compares timestamps instead.
  // Same answer on this page's input, and no longer dependent on it.
  //
  // The topic NAME is still resolved here. It is display metadata, not part of
  // the score, and grades.ts deliberately knows nothing about it.
  const curriculumRows = [...latestAttemptScores(attempts).entries()]
    .map(([key, score]) => {
      const [courseId, topicId, section] = key.split(':');
      return {
        key,
        topic: topicNames.get(`${courseId}:${topicId}`) ?? topicId,
        section,
        correct: score.correct,
        total: score.total,
        last: score.lastWorkedAt,
      };
    })
    .sort((a, b) => b.last.localeCompare(a.last));

  const completedSessions = sessions.filter((s) => s.final_score !== null);
  const best = completedSessions.reduce<number | null>(
    (acc, s) => (s.final_score !== null && (acc === null || s.final_score > acc) ? s.final_score : acc),
    null
  );

  return (
    <>
      <PageHeading title="Grades" blurb="Every score on your account, newest first." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <CardTitle>Practice tests</CardTitle>
              {best !== null && (
                <span style={{ font: `400 13px ${FONT_BODY}`, color: V.muted }}>
                  Best score <strong style={{ color: V.heading }}>{best}</strong>
                </span>
              )}
            </div>

            {sessions.length === 0 ? (
              <Muted size={13.5}>
                You have not taken a practice test yet. There is one at{' '}
                <a href="/adaptive-test">the adaptive test</a>.
              </Muted>
            ) : (
              <div className="um-scroll-x">
                <table>
                  <caption className="um-visually-hidden">
                    Your adaptive practice test history
                  </caption>
                  <thead>
                    <tr>
                      {['Date', 'Status', 'Score'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          style={{
                            textAlign: h === 'Score' ? 'right' : 'left',
                            padding: '8px 12px 8px 0',
                            borderBottom: `1px solid ${V.trackBg}`,
                            font: `600 12px ${FONT_BODY}`,
                            color: V.dim,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${V.hairline}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: V.heading,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(s.created_at)}
                        </td>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${V.hairline}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            // V.noticeOk, not C.green: the same token on the
                            // same ground as JoinClassPanel's success line, so
                            // fixing that one necessarily fixes this one too.
                            color: s.completed_at ? V.noticeOk : V.dim,
                          }}
                        >
                          {s.completed_at ? 'Completed' : 'Not finished'}
                        </td>
                        <td
                          style={{
                            padding: '11px 0',
                            borderBottom: `1px solid ${V.hairline}`,
                            textAlign: 'right',
                            font: `600 14px ${FONT_HEADING}`,
                            color: s.final_score === null ? V.dim : V.heading,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.final_score ?? '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <CardTitle>Curriculum work</CardTitle>

            {curriculumRows.length === 0 ? (
              <Muted size={13.5}>
                Nothing here yet. Answers you submit on a topic page show up as soon as you check
                them.
              </Muted>
            ) : (
              <div className="um-scroll-x">
                <table>
                  <caption className="um-visually-hidden">
                    Your practice and mini quiz results by topic
                  </caption>
                  <thead>
                    <tr>
                      {['Topic', 'Section', 'Last worked', 'Correct'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          style={{
                            textAlign: h === 'Correct' ? 'right' : 'left',
                            padding: '8px 12px 8px 0',
                            borderBottom: `1px solid ${V.trackBg}`,
                            font: `600 12px ${FONT_BODY}`,
                            color: V.dim,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {curriculumRows.map((row) => (
                      <tr key={row.key}>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${V.hairline}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: V.heading,
                          }}
                        >
                          {row.topic}
                        </td>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${V.hairline}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: V.muted,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {SECTION_LABELS[row.section] ?? row.section}
                        </td>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${V.hairline}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: V.muted,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(row.last)}
                        </td>
                        <td
                          style={{
                            padding: '11px 0',
                            borderBottom: `1px solid ${V.hairline}`,
                            textAlign: 'right',
                            font: `600 14px ${FONT_HEADING}`,
                            color: V.heading,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.correct}/{row.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {sessions.length === 0 && curriculumRows.length === 0 && (
          <EmptyState
            title="No scores yet"
            detail="Take a practice test or work through a topic, and your results will collect here."
          />
        )}
      </div>
    </>
  );
}
