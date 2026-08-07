import { getProfile } from '../../lib/auth';
import { getAnnouncements, getEnrolledClasses } from '../data';
import { Card, EmptyState, Muted, PageHeading, formatDate } from '../ui';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';

// Announcements. Read-only for students, reverse-chronological, scoped to the
// classes they are enrolled in plus anything posted without a class.
//
// Teachers write these from the form on /teacher, which posts to
// /api/teacher/announcements and inserts through the admin client. Nothing here
// writes.

export default async function AnnouncementsPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [result, classes] = await Promise.all([
    getAnnouncements(profile.id),
    getEnrolledClasses(profile.id),
  ]);

  const classNames = new Map(classes.map((c) => [c.id, c.name]));

  return (
    <>
      <PageHeading
        title="Announcements"
        blurb={
          classes.length
            ? `Posts from ${classes.map((c) => c.name).join(', ')}.`
            : 'Posts from your teachers.'
        }
      />

      {result.status === 'not_provisioned' ? (
        // Honest about the cause rather than showing an empty list, which would
        // read as "no news" when the truth is the table has not been created.
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ font: `600 15px ${FONT_HEADING}`, color: V.heading }}>
              Announcements are not switched on yet
            </div>
            <Muted size={13.5}>
              This page is ready, but the announcements table has not been created on the database
              yet. Ask your teacher to run the migration in sql/announcements.sql.
            </Muted>
          </div>
        </Card>
      ) : result.announcements.length === 0 ? (
        <EmptyState
          title="Nothing posted yet"
          detail="When a teacher posts an announcement to your class, it will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.announcements.map((item) => (
            <article
              key={item.id}
              style={{
                background: V.cardBg,
                border: `1px solid ${V.cardBorder}`,
                borderRadius: 16,
                padding: '20px 22px',
                boxShadow: '0 1px 3px rgba(14,14,17,.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <h2 style={{ margin: 0, font: `600 17px ${FONT_HEADING}`, color: V.heading }}>
                  {item.title}
                </h2>
                <span style={{ font: `400 12.5px ${FONT_BODY}`, color: V.dim }}>
                  {formatDate(item.created_at)}
                </span>
              </div>

              {item.class_id && classNames.has(item.class_id) && (
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: V.subtleBg,
                    font: `500 11.5px ${FONT_BODY}`,
                    color: V.muted,
                  }}
                >
                  {classNames.get(item.class_id)}
                </span>
              )}

              {/* Plain text, rendered as text. Teacher-authored copy is not run
                  through the markdown pipeline, so nothing here can inject
                  markup into another student's page. */}
              <p
                style={{
                  margin: 0,
                  font: `400 14.5px ${FONT_BODY}`,
                  lineHeight: 1.7,
                  color: V.ink,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
