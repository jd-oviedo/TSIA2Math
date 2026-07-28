import { getProfile } from '../../lib/auth';
import { getTopics, getAttempts, getTestSessions } from '../data';
import { Card, CardTitle, EmptyState, Muted, PageHeading, formatDate } from '../ui';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

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
  // counting twice. curriculum_attempts is append-only and already sorted
  // newest first, so the first row seen for an item is the current one.
  const latest = new Map<string, { is_correct: boolean; created_at: string }>();
  for (const a of attempts) {
    const key = `${a.course_id}:${a.topic_id}:${a.section}:${a.item_number}`;
    if (!latest.has(key)) latest.set(key, { is_correct: a.is_correct, created_at: a.created_at });
  }

  type Row = { key: string; topic: string; section: string; correct: number; total: number; last: string };
  const byTopicSection = new Map<string, Row>();
  for (const [key, value] of latest) {
    const [courseId, topicId, section] = key.split(':');
    const rowKey = `${courseId}:${topicId}:${section}`;
    const existing = byTopicSection.get(rowKey);
    if (existing) {
      existing.total += 1;
      if (value.is_correct) existing.correct += 1;
      if (value.created_at > existing.last) existing.last = value.created_at;
    } else {
      byTopicSection.set(rowKey, {
        key: rowKey,
        topic: topicNames.get(`${courseId}:${topicId}`) ?? topicId,
        section,
        correct: value.is_correct ? 1 : 0,
        total: 1,
        last: value.created_at,
      });
    }
  }
  const curriculumRows = [...byTopicSection.values()].sort((a, b) => b.last.localeCompare(a.last));

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
                <span style={{ font: `400 13px ${FONT_BODY}`, color: ink(0.55) }}>
                  Best score <strong style={{ color: C.midnight }}>{best}</strong>
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
                            borderBottom: `1px solid ${ink(0.1)}`,
                            font: `600 12px ${FONT_BODY}`,
                            color: ink(0.5),
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
                            borderBottom: `1px solid ${ink(0.06)}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: C.midnight,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(s.created_at)}
                        </td>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${ink(0.06)}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: s.completed_at ? C.green : ink(0.5),
                          }}
                        >
                          {s.completed_at ? 'Completed' : 'Not finished'}
                        </td>
                        <td
                          style={{
                            padding: '11px 0',
                            borderBottom: `1px solid ${ink(0.06)}`,
                            textAlign: 'right',
                            font: `600 14px ${FONT_HEADING}`,
                            color: s.final_score === null ? ink(0.35) : C.midnight,
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
                            borderBottom: `1px solid ${ink(0.1)}`,
                            font: `600 12px ${FONT_BODY}`,
                            color: ink(0.5),
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
                            borderBottom: `1px solid ${ink(0.06)}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: C.midnight,
                          }}
                        >
                          {row.topic}
                        </td>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${ink(0.06)}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: ink(0.6),
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {SECTION_LABELS[row.section] ?? row.section}
                        </td>
                        <td
                          style={{
                            padding: '11px 12px 11px 0',
                            borderBottom: `1px solid ${ink(0.06)}`,
                            font: `400 13.5px ${FONT_BODY}`,
                            color: ink(0.6),
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(row.last)}
                        </td>
                        <td
                          style={{
                            padding: '11px 0',
                            borderBottom: `1px solid ${ink(0.06)}`,
                            textAlign: 'right',
                            font: `600 14px ${FONT_HEADING}`,
                            color: C.midnight,
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
