import { getProfile } from '../lib/auth';
import { resolveCourseAccess } from '../lib/course-access';
import { FREE_SAMPLE } from '../lib/capabilities';
import {
  getTopics,
  getAttempts,
  progressByTopic,
  mostRecentTopic,
  gradableTotal,
  getEnrolledClasses,
  getAnnouncements,
  getStudentAssignments,
  hasCompletedDiagnostic,
  topicHref,
} from './data';
import { nextDue } from '@/app/lib/assignments';
import AssignmentsHomeCard from './AssignmentsHomeCard';
import { recommendForStudent } from '@/app/lib/recommendation';
import { STRAND_NAMES } from '@/app/lib/strands';
import {
  Card,
  CardTitle,
  Muted,
  PageHeading,
  PageStack,
  ProgressBar,
  SectionGroup,
  SPACING,
  formatDate,
} from './ui';
import DiagnosticCta from './DiagnosticCta';
import JoinClassPanel from './JoinClassPanel';
import JoinResultBanner from './JoinResultBanner';
import FlagsPanel from './FlagsPanel';
import { C } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';

// Home. Deliberately quiet: a progress bar, one place to pick up, and the
// class join box. No badges, no streaks, nothing that turns a study tool into
// a game.

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ join?: string; jc?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) return null; // The layout has already redirected.

  // The join-code outcome, written onto this URL by app/auth/callback. `jc` is
  // the class name, so the banner can say which class rather than "a class".
  const { join, jc } = await searchParams;

  const [
    { topics, shapes },
    attempts,
    classes,
    announcements,
    testedBefore,
    recommendation,
    access,
    assignments,
  ] = await Promise.all([
    getTopics(),
    getAttempts(profile.id),
    getEnrolledClasses(profile.id),
    getAnnouncements(profile.id),
    hasCompletedDiagnostic(profile.id),
    recommendForStudent(profile.id),
    // In the Promise.all rather than awaited on its own, so it costs latency
    // nothing. It is NOT already resolved on this request: resolveCourseAccess
    // is cache()d per request, but nothing else on /dashboard calls it, so this
    // is the first call and pays for its own profile read.
    //
    // AND IT HAS TO BE THIS, not profileGrants(profile, 'curriculum') on the
    // profile two lines up. That shortcut would be wrong for the two groups who
    // reach the tree without a curriculum plan: teachers, through the second
    // door, and students with derived access from an entitled teacher's class.
    // Both would be told the free sample is all they have.
    resolveCourseAccess(),
    // In the same Promise.all for the same reason. It shares resolveCourseAccess
    // with the line above -- that resolver is cache()d per request, so the two
    // calls are one profile read however they interleave.
    getStudentAssignments(profile.id),
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

  // The next one or two pieces of work still to do.
  //
  // COMPLETED ASSIGNMENTS ARE EXCLUDED FROM HOME and stay on the full page.
  // Home answers "what should I do next", and finished work is not an answer to
  // that; /dashboard/assignments answers "what have I been set", where it is.
  // The exclusion lives inside nextDue() so the count below and the list cannot
  // come apart -- both are derived from the same predicate.
  const stillToDo = assignments.filter((a) => a.status !== 'complete');
  const nextAssignments = nextDue(assignments, (a) => a.status !== 'complete');

  const progress = progressByTopic(attempts, shapes);
  const totalItems = [...shapes.values()].reduce((sum, shape) => sum + gradableTotal(shape), 0);
  const doneItems = [...progress.values()].reduce((a, p) => a + p.correct, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  // THE FREE SAMPLE PREEMPTS EVERY OTHER SUGGESTION ON THIS CARD.
  //
  // Every branch below picks a topic from the whole course and none of them
  // knows what this viewer can open, so for a student without curriculum they
  // all point at the gate. Measured rather than assumed: of the eight accounts
  // with any history, seven had a most-recent topic they can no longer open, so
  // "Pick up where you left off" was the common case and the first-topic
  // fallback was the rare one.
  //
  // Preempting is not discarding their history. Their past work still shows in
  // the progress bar directly below this card, in /dashboard/modules, and in
  // /dashboard/grades, none of which is entitlement-gated. What is removed is a
  // primary button pointing at a locked door.
  //
  // Falls through to the normal branches if the sample topic is not in the
  // course at all, which would be a content error rather than a plan one:
  // degrading to today's behaviour beats rendering a link that 404s.
  const sampleTopic = access.curriculum
    ? undefined
    : topics.find(
        (t) => t.course_id === FREE_SAMPLE.courseId && t.topic_id === FREE_SAMPLE.topicId
      );

  const recent = mostRecentTopic(attempts);
  const recentTopic = sampleTopic
    ? undefined
    : recent
      ? topics.find((t) => t.course_id === recent.course_id && t.topic_id === recent.topic_id)
      : undefined;
  const recentProgress = recentTopic
    ? progress.get(`${recentTopic.course_id}:${recentTopic.topic_id}`)
    : undefined;

  // Where to send a student who has not attempted anything yet.
  //
  // This used to be topics[0] -- the first topic in the course, the same one for
  // everybody, whatever their diagnostic said. It now prefers the weakest strand
  // from their diagnostic and falls back to topics[0] when there is nothing to
  // go on: no diagnostic taken, or a session whose breakdown has no attempted
  // strand in it.
  //
  // The two sources are normalised to one shape here so the card below renders
  // one way. reason is the line that explains the choice, and is null for the
  // fallback -- a generic first topic is not a finding and should not be dressed
  // up as one.
  const recommended = recommendation.status === 'ok' ? recommendation : null;
  const fallbackTopic = topics[0];
  const startTopic = sampleTopic
    ? {
        topic_id: sampleTopic.topic_id,
        topic_name: sampleTopic.topic_name,
        unit_number: sampleTopic.unit_number,
        href: topicHref(sampleTopic),
        isPlaceholder: false,
        // Setting a reason also flips the button label from "Start the first
        // topic" to "Start here" through the existing ternary below, which is
        // the right claim here: this is genuinely where they can start.
        reason: 'This topic is free on your plan. The Full Course opens the other 96.',
      }
    : recommended
    ? {
        topic_id: recommended.topic.topic_id,
        topic_name: recommended.topic.topic_name,
        unit_number: recommended.topic.unit_number,
        href: recommended.topic.href,
        isPlaceholder: recommended.topic.is_placeholder,
        reason: `${STRAND_NAMES[recommended.strand]} was your weakest strand on the diagnostic, ${recommended.pct}% across ${recommended.attempted} ${recommended.attempted === 1 ? 'question' : 'questions'}.`,
      }
    : fallbackTopic
      ? {
          topic_id: fallbackTopic.topic_id,
          topic_name: fallbackTopic.topic_name,
          unit_number: fallbackTopic.unit_number,
          href: topicHref(fallbackTopic),
          isPlaceholder: false,
          reason: null,
        }
      : null;

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

      {/* THREE GROUPS, AND THE SEAMS ARE THE ONES THIS FILE ALREADY NAMED.
          ==================================================================
          Home was one flat column at a single 16px gap: eight panels, the same
          white fill, the same border, the same radius, evenly spaced. The split
          below is not new information architecture -- the comment further down
          this file has described it since the assignments card landed: the
          announcements and assignments cards are "things somebody else needs
          from you", and everything after them is "what you were already doing".
          That division was written down and never rendered.

          It is rendered now as WHITESPACE AND NOTHING ELSE. GROUP is 28px
          against STACK's 16, and no group carries a band, a fill, a rule or a
          label. Adding one would be the drift this pass exists to avoid, and
          the group containers are asserted to have no background in both themes
          by scripts/verify_shell_spacing.mjs.

          Each group is wrapped in its own condition rather than holding
          conditional children, because an empty SectionGroup is still a flex
          item and would leave a 28px hole where a group used to be. */}
      <PageStack>
        {(join || !testedBefore) && (
          <SectionGroup>
            {/* First thing on the page when a class code came through the
                sign-in, because it answers the question the student is holding:
                did it work? Rendered for EVERY outcome including the failures --
                landing here silently unenrolled is the state this whole flow
                exists to prevent. */}
            {join && <JoinResultBanner outcome={join} className={jc} />}

            {/* Above the announcements and the progress cards, and only until
                the student has finished one diagnostic. It adds a card rather
                than replacing any -- see DiagnosticCta for why nothing below it
                moves. */}
            {!testedBefore && <DiagnosticCta />}
          </SectionGroup>
        )}

        {(recentAnnouncements.length > 0 || nextAssignments.length > 0) && (
          <SectionGroup>
            {recentAnnouncements.length > 0 && (
              <Card>
                {/* THE HEADER ROW IS A SIBLING OF THE CONTENT, NOT A FLEX CHILD
                    ABOVE IT. CardTitle's own margin is the header-to-content
                    distance; nested inside the BLOCK-gapped column below, the
                    real distance would be margin + gap, which is how this card
                    used to say 4 and measure 18. */}
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
                    {recentAnnouncements.length === 1
                      ? 'Latest announcement'
                      : 'Latest announcements'}
                  </CardTitle>
                  <a
                    href="/dashboard/announcements"
                    style={{ font: `600 13px ${FONT_BODY}`, color: V.heading, textDecoration: 'underline' }}
                  >
                    {moreAnnouncements > 0 ? `See all ${announcements.status === 'ok' ? announcements.announcements.length : ''}` : 'See all'}
                  </a>
                </div>

                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: SPACING.BLOCK }}
                >
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
                        <div style={{ font: `600 15px ${FONT_HEADING}`, color: V.heading }}>
                          {item.title}
                        </div>
                        <span style={{ font: `400 12px ${FONT_BODY}`, color: V.dim }}>
                          {formatDate(item.created_at)}
                          {item.class_id && classNames.has(item.class_id)
                            ? ` · ${classNames.get(item.class_id)}`
                            : ''}
                        </span>
                      </div>

                      {/* Plain text, rendered as text, exactly as the
                          Announcements tab does. Teacher copy never goes
                          through markdown. */}
                      <p
                        style={{
                          margin: 0,
                          font: `400 13.5px ${FONT_BODY}`,
                          lineHeight: 1.6,
                          color: V.ink,
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

            {/* Grouped with the announcements card above it, because they are
                the same half of this page: things somebody else needs from you.
                Everything in the next group is what you were already doing.

                RENDERS NOTHING AT ALL when there is no incomplete work -- not an
                empty card, not a "nothing assigned" line. Home is the page every
                student lands on every session, and the great majority of them
                have no assignments; a permanent empty card would cost all of
                them screen space to tell them nothing. The full page is one nav
                click away and says so properly. */}
            {nextAssignments.length > 0 && (
              <Card>
                <AssignmentsHomeCard assignments={nextAssignments} total={stillToDo.length} />
              </Card>
            )}
          </SectionGroup>
        )}

        <SectionGroup>
          <Card>
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
              <span style={{ font: `600 22px ${FONT_HEADING}`, color: V.heading }}>{pct}%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.BLOCK }}>
              <ProgressBar value={doneItems} total={totalItems} />
              <Muted size={13}>
                {totalItems === 0
                  ? 'No curriculum items are published yet.'
                  : `${doneItems} of ${totalItems} practice and quiz questions answered correctly, across ${topics.length} topics.`}
              </Muted>
            </div>
          </Card>

          <Card>
            {/* THIS CARD HAD NO HEADING. It is the largest panel on the page and
                it opened with an 11px uppercase eyebrow while every neighbour
                opened with 16px heading ink, so it did not read as a peer of
                them -- half of what made this column look flat.

                The eyebrow is PROMOTED to the panel tier rather than joined by a
                heading: the words were already right, only the tier was wrong,
                and adding a title above the eyebrow would have said the same
                thing twice. No colour changed -- the eyebrow's V.dim is gone and
                CardTitle's V.heading is the tier's ink, both already paired. */}
            <CardTitle>{recentTopic ? 'Pick up where you left off' : 'Start here'}</CardTitle>

            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.BLOCK }}>
              {recentTopic ? (
                <>
                  <div>
                    <div style={{ font: `600 19px ${FONT_HEADING}`, color: V.heading }}>
                      {recentTopic.topic_name}
                    </div>
                    <div style={{ marginTop: 4, font: `400 13px ${FONT_BODY}`, color: V.dim }}>
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
              ) : startTopic ? (
                <>
                  {startTopic.reason && (
                    <div style={{ font: `400 13px ${FONT_BODY}`, lineHeight: 1.6, color: V.dim }}>
                      {startTopic.reason}
                    </div>
                  )}
                  <div>
                    <div style={{ font: `600 19px ${FONT_HEADING}`, color: V.heading }}>
                      {startTopic.topic_name}
                    </div>
                    <div style={{ marginTop: 4, font: `400 13px ${FONT_BODY}`, color: V.dim }}>
                      Unit {startTopic.unit_number} · {startTopic.topic_id}
                    </div>
                  </div>
                  <a
                    className="um-btn-primary"
                    href={startTopic.href}
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
                    {startTopic.isPlaceholder
                      ? 'See what happens next'
                      : startTopic.reason
                        ? 'Start here'
                        : 'Start the first topic'}
                  </a>
                </>
              ) : (
                <Muted size={13.5}>There is no curriculum published for your course yet.</Muted>
              )}
            </div>
          </Card>

          <Card>
            <JoinClassPanel />
          </Card>

          {profile.role === 'teacher' && (
            <Card>
              <FlagsPanel />
            </Card>
          )}
        </SectionGroup>
      </PageStack>
    </>
  );
}
