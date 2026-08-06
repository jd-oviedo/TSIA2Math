import { getProfile } from '../lib/auth';
import {
  getTopics,
  getAttempts,
  progressByTopic,
  mostRecentTopic,
  gradableTotal,
  getEnrolledClasses,
  getAnnouncements,
} from './data';
import { Card, CardTitle, Eyebrow, Muted, PageHeading, ProgressBar, formatDate } from './ui';
import JoinClassPanel from './JoinClassPanel';
import FlagsPanel from './FlagsPanel';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// Home. Deliberately quiet: a progress bar, one place to pick up, and the
// class join box. No badges, no streaks, nothing that turns a study tool into
// a game.

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) return null; // The layout has already redirected.

  const { code } = await searchParams;

  const [{ topics, shapes }, attempts, classes, announcements] = await Promise.all([
    getTopics(),
    getAttempts(profile.id),
    getEnrolledClasses(profile.id),
    getAnnouncements(profile.id),
  ]);

  // Same source as the Announcements tab: already scoped to every class the
  // student is enrolled in, plus school-wide notices, newest first. Home shows
  // the two most recent and points at the tab for the rest, so a teacher on a
  // posting spree cannot push the course progress card off the screen.
  const HOME_ANNOUNCEMENT_CAP = 2;
  const recentAnnouncements =
    announcements.status === 'ok' ? announcements.announcements.slice(0, HOME_ANNOUNCEMENT_CAP) : [];
  const moreAnnouncements =
    announcements.status === 'ok'
      ? announcements.announcements.length - recentAnnouncements.length
      : 0;
  const classNames = new Map(classes.map((c) => [c.id, c.name]));

  const progress = progressByTopic(attempts, shapes);
  const totalItems = [...shapes.values()].reduce((sum, shape) => sum + gradableTotal(shape), 0);
  const doneItems = [...progress.values()].reduce((a, p) => a + p.correct, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const recent = mostRecentTopic(attempts);
  const recentTopic = recent
    ? topics.find((t) => t.course_id === recent.course_id && t.topic_id === recent.topic_id)
    : undefined;
  const recentProgress = recentTopic
    ? progress.get(`${recentTopic.course_id}:${recentTopic.topic_id}`)
    : undefined;

  // Next unstarted topic, for the student who has not attempted anything yet.
  const firstTopic = topics[0];

  function topicHref(topic: { course_id: string; topic_id: string; unit_number: number }) {
    const [test, subject] = topic.course_id.split('-');
    return `/course/${test}/${subject}/unit/${topic.unit_number}/topic/${topic.topic_id}`;
  }

  return (
    <>
      <PageHeading
        title="Home"
        blurb={
          classes.length
            ? `You're in ${classes.map((c) => c.name).join(', ')}.`
            : 'Your course progress and where to pick back up.'
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {recentAnnouncements.length > 0 && (
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
                <CardTitle>
                  {recentAnnouncements.length === 1 ? 'Latest announcement' : 'Latest announcements'}
                </CardTitle>
                <a
                  href="/dashboard/announcements"
                  style={{ font: `600 13px ${FONT_BODY}`, color: C.midnight, textDecoration: 'underline' }}
                >
                  {moreAnnouncements > 0 ? `See all ${announcements.status === 'ok' ? announcements.announcements.length : ''}` : 'See all'}
                </a>
              </div>

              {recentAnnouncements.map((item) => (
                <article
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    paddingLeft: 13,
                    borderLeft: `3px solid ${C.sunset}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ font: `600 15px ${FONT_HEADING}`, color: C.midnight }}>
                      {item.title}
                    </div>
                    <span style={{ font: `400 12px ${FONT_BODY}`, color: ink(0.45) }}>
                      {formatDate(item.created_at)}
                      {item.class_id && classNames.has(item.class_id)
                        ? ` · ${classNames.get(item.class_id)}`
                        : ''}
                    </span>
                  </div>

                  {/* Plain text, rendered as text, exactly as the Announcements
                      tab does. Teacher copy never goes through markdown. */}
                  <p
                    style={{
                      margin: 0,
                      font: `400 13.5px ${FONT_BODY}`,
                      lineHeight: 1.6,
                      color: ink(0.72),
                      whiteSpace: 'pre-wrap',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </Card>
        )}

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
              <CardTitle>Course progress</CardTitle>
              <span style={{ font: `600 22px ${FONT_HEADING}`, color: C.midnight }}>{pct}%</span>
            </div>
            <ProgressBar value={doneItems} total={totalItems} />
            <Muted size={13}>
              {totalItems === 0
                ? 'No curriculum items are published yet.'
                : `${doneItems} of ${totalItems} practice and quiz questions answered correctly, across ${topics.length} topics.`}
            </Muted>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Eyebrow color={C.sunset}>
              {recentTopic ? 'Pick up where you left off' : 'Start here'}
            </Eyebrow>

            {recentTopic ? (
              <>
                <div>
                  <div style={{ font: `600 19px ${FONT_HEADING}`, color: C.midnight }}>
                    {recentTopic.topic_name}
                  </div>
                  <div style={{ marginTop: 4, font: `400 13px ${FONT_BODY}`, color: ink(0.5) }}>
                    Unit {recentTopic.unit_number} · {recentTopic.topic_id}
                    {recentProgress && recentProgress.total > 0
                      ? ` · ${recentProgress.correct} of ${recentProgress.total} correct so far`
                      : ''}
                  </div>
                </div>
                <a
                  className="um-btn-primary"
                  href={topicHref(recentTopic)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '12px 26px',
                    borderRadius: 11,
                    background: C.sunset,
                    boxShadow: `0 2px 0 ${C.sunsetShadow}`,
                    font: `600 15px ${FONT_BODY}`,
                    color: C.midnight,
                  }}
                >
                  Keep going
                </a>
              </>
            ) : firstTopic ? (
              <>
                <div>
                  <div style={{ font: `600 19px ${FONT_HEADING}`, color: C.midnight }}>
                    {firstTopic.topic_name}
                  </div>
                  <div style={{ marginTop: 4, font: `400 13px ${FONT_BODY}`, color: ink(0.5) }}>
                    Unit {firstTopic.unit_number} · {firstTopic.topic_id}
                  </div>
                </div>
                <a
                  className="um-btn-primary"
                  href={topicHref(firstTopic)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '12px 26px',
                    borderRadius: 11,
                    background: C.sunset,
                    boxShadow: `0 2px 0 ${C.sunsetShadow}`,
                    font: `600 15px ${FONT_BODY}`,
                    color: C.midnight,
                  }}
                >
                  Start the first topic
                </a>
              </>
            ) : (
              <Muted size={13.5}>There is no curriculum published for your course yet.</Muted>
            )}
          </div>
        </Card>

        <Card>
          <JoinClassPanel initialCode={code} />
        </Card>

        {profile.role === 'teacher' && (
          <Card padding="16px 24px">
            <FlagsPanel />
          </Card>
        )}
      </div>
    </>
  );
}
