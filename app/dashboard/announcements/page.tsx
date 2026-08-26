import { getProfile } from '../../lib/auth';
import { getAnnouncements, getEnrolledClasses } from '../data';
import { Card, CardTitle, EmptyState, Muted, PageHeading, SectionGroup } from '../ui';
import AnnouncementCard from './AnnouncementCard';

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
          {/* Was a 600 15px <div> -- a sixth header size, and not a heading at
              all to a screen reader. CardTitle is the panel tier and a real h2. */}
          <CardTitle>Announcements are not switched on yet</CardTitle>
          <Muted size={13.5}>
            This page is ready, but the announcements table has not been created on the database
            yet. Ask your teacher to run the migration in sql/announcements.sql.
          </Muted>
        </Card>
      ) : result.announcements.length === 0 ? (
        <EmptyState
          title="Nothing posted yet"
          detail="When a teacher posts an announcement to your class, it will appear here."
        />
      ) : (
        <SectionGroup>
          {result.announcements.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              classLabel={item.class_id ? classNames.get(item.class_id) : null}
            />
          ))}
        </SectionGroup>
      )}
    </>
  );
}
