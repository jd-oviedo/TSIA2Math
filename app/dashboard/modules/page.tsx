import { getProfile } from '../../lib/auth';
import {
  getTopics,
  getAttempts,
  progressByTopic,
  gradableTotal,
  type TopicRow,
  type TopicProgress,
} from '../data';
import { Card, EmptyState, Eyebrow, Muted, PageHeading, ProgressBar } from '../ui';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// Modules. The curriculum browse surface: units, the topics inside them, and
// how far this student has got in each. The tree is read from curriculum_topics
// rather than hardcoded, so a newly uploaded topic appears here without a code
// change.

function topicHref(topic: TopicRow) {
  const [test, subject] = topic.course_id.split('-');
  return `/course/${test}/${subject}/unit/${topic.unit_number}/topic/${topic.topic_id}`;
}

function statusOf(p: TopicProgress | undefined) {
  if (!p || p.total === 0) return { label: 'Not started', color: ink(0.4), dot: ink(0.18) };
  if (p.correct >= p.total) return { label: 'Complete', color: C.green, dot: C.green };
  if (p.attempted > 0) return { label: 'In progress', color: C.sunset, dot: C.sunset };
  return { label: 'Not started', color: ink(0.4), dot: ink(0.18) };
}

export default async function ModulesPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [{ topics, shapes }, attempts] = await Promise.all([
    getTopics(),
    getAttempts(profile.id),
  ]);
  const progress = progressByTopic(attempts, shapes);

  const units = new Map<number, TopicRow[]>();
  for (const topic of topics) {
    if (!units.has(topic.unit_number)) units.set(topic.unit_number, []);
    units.get(topic.unit_number)!.push(topic);
  }

  return (
    <>
      <PageHeading
        title="Modules"
        blurb="Every unit in your course, and how far you have got in each topic."
      />

      {units.size === 0 ? (
        <EmptyState
          title="No modules yet"
          detail="Your course has no published curriculum topics."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[...units.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([unitNumber, unitTopics]) => {
              const unitTotal = unitTopics.reduce(
                (sum, t) => sum + gradableTotal(shapes.get(`${t.course_id}:${t.topic_id}`)),
                0
              );
              const unitDone = unitTopics.reduce(
                (sum, t) => sum + (progress.get(`${t.course_id}:${t.topic_id}`)?.correct ?? 0),
                0
              );

              return (
                <section
                  key={unitNumber}
                  style={{ display: 'flex', flexDirection: 'column', gap: 11 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <h2 style={{ margin: 0, font: `600 18px ${FONT_HEADING}`, color: C.midnight }}>
                      Unit {unitNumber}
                    </h2>
                    <Muted size={13}>
                      {unitTopics.length} {unitTopics.length === 1 ? 'topic' : 'topics'}
                    </Muted>
                    <div style={{ flex: 1, minWidth: 90, maxWidth: 180 }}>
                      <ProgressBar value={unitDone} total={unitTotal} height={6} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {unitTopics.map((topic) => {
                      const p = progress.get(`${topic.course_id}:${topic.topic_id}`);
                      const status = statusOf(p);
                      return (
                        <a
                          key={topic.topic_id}
                          className="um-card-link"
                          href={topicHref(topic)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '15px 18px',
                            borderRadius: 13,
                            background: C.paper,
                            boxShadow: `inset 0 0 0 1px ${ink(0.08)}`,
                            color: 'inherit',
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: 9,
                              height: 9,
                              flex: 'none',
                              borderRadius: '50%',
                              background: status.dot,
                            }}
                          />
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                display: 'block',
                                font: `500 15px ${FONT_BODY}`,
                                color: C.midnight,
                              }}
                            >
                              {topic.topic_name}
                            </span>
                            <span
                              style={{
                                display: 'block',
                                marginTop: 2,
                                font: `400 12.5px ${FONT_BODY}`,
                                color: ink(0.45),
                              }}
                            >
                              {topic.topic_id}
                              {topic.estimated_time_minutes
                                ? ` · about ${topic.estimated_time_minutes} min`
                                : ''}
                              {p && p.total > 0 ? ` · ${p.correct}/${p.total} correct` : ''}
                            </span>
                          </span>
                          <span
                            style={{
                              flex: 'none',
                              font: `500 12.5px ${FONT_BODY}`,
                              color: status.color,
                            }}
                          >
                            {status.label}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </section>
              );
            })}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <Card padding="16px 20px">
          <Eyebrow>How progress is counted</Eyebrow>
          <div style={{ marginTop: 6 }}>
            <Muted size={13}>
              A question counts once you have answered it correctly, so coming back to one you
              missed still moves the bar. Written practice is not counted, since nothing grades it.
            </Muted>
          </div>
        </Card>
      </div>
    </>
  );
}
