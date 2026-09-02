import { getProfile } from '../../lib/auth';
import { getAnnouncements, getEnrolledClasses, showsClassChrome } from '../data';
import { Card, CardTitle, EmptyState, Muted, PageHeading, SectionGroup } from '../ui';
import AnnouncementCard from './AnnouncementCard';

// Announcements. Read-only for students, reverse-chronological, scoped to the
// classes they are enrolled in plus anything posted without a class.
//
// Teachers write these from the form on /teacher, which posts to
// /api/teacher/announcements and inserts through the admin client. Nothing here
// writes.
//
// THIS ROUTE STAYS OPEN TO A SOLO STUDENT, whose rail no longer offers it. That
// is a deliberate choice between the two ways to make a hidden route safe, and
// the reasoning is worth keeping because the other one looks tidier:
//
//   A REDIRECT TO HOME would be wrong here, not merely blunt. A null class_id
//   is a SCHOOL-WIDE notice (sql/announcements.sql) and reaches everyone, so
//   this page is not necessarily empty for a solo student -- and Home's own
//   announcements card links straight here with "See all". A redirect would
//   turn a live link on the page it redirects to into a loop, and would hide
//   real content from the person it was posted for.
//
//   AN EMPTY STATE costs nothing, keeps every deep link and bookmark working,
//   and can say WHY the page is empty instead of leaving a student to guess.
//
// Hiding a nav item is presentation. Nothing here is a permission boundary and
// nothing about who may read what changed: the scope is still
// getAnnouncements, which was already correct for a student with no classes.

export default async function AnnouncementsPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [result, classes, hasClass] = await Promise.all([
    getAnnouncements(profile.id),
    getEnrolledClasses(profile.id),
    showsClassChrome(profile),
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
        // TWO EMPTY STATES, BECAUSE THEY ARE NOT THE SAME EMPTY. The old copy
        // said "when a teacher posts an announcement to your class" to a
        // student who has no class and no teacher, which reads as waiting for
        // something that is never coming. A solo student is told the actual
        // reason and what would change it; a rostered student keeps the
        // original wording, which is true for them.
        hasClass ? (
          <EmptyState
            title="Nothing posted yet"
            detail="When a teacher posts an announcement to your class, it will appear here."
          />
        ) : (
          <EmptyState
            title="You're not in a class yet"
            detail="Announcements come from a teacher. If you're given a class code, you can join from the link on your Home page — anything posted to your class will show up here."
          />
        )
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
